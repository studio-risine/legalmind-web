# Database Migration Changelog

This document provides a chronological history of all database migrations, structural changes, and major architectural decisions for the Legal Mind project.

## Overview

Legal Mind transitioned from Convex to Supabase (PostgreSQL) with Drizzle ORM as part of a major architectural refactoring. This changelog documents that migration and all subsequent schema changes.

---

## Migration History

### [2024-Q4] Platform Migration: Convex → Supabase + Drizzle ORM

**Context:** The project migrated from Convex (NoSQL) to Supabase (PostgreSQL) with Drizzle ORM to gain better relational data modeling, stronger typing, and more control over the database schema.

**Key Changes:**
- Replaced Convex backend with Supabase PostgreSQL
- Implemented Drizzle ORM for type-safe database access
- Migrated all data models to relational schema
- Updated authentication to use Supabase Auth with SSR helpers

**Entity Mapping:**

| Old (Convex)     | New (Postgres)   | Notes                                                    |
|------------------|------------------|----------------------------------------------------------|
| `customers`      | `clients`        | Renamed to match legal industry terminology              |
| `cases`          | `processes`      | Keeps CNJ number, court, status                          |
| `tasks`          | `deadlines`      | Due date, type, status, priority; links to process/client|
| `notifications`  | `notifications`  | Channel, scheduled/sent times, status                    |
| `users`          | `accounts`       | Synced with auth.users for RBAC                          |
| `activity`       | *(not implemented)* | Audit trail (planned for future)                   |

**Terminology Change:** `customer` → `client`
- All code, documentation, and database schemas now use "client"
- Enforced via naming conventions and code reviews
- UI and API consistently use "client" terminology

**Migration Files:**
- See `/backups/2025-10-19/docs/migration/` for historical migration scripts
- Original Convex export scripts archived

---

### [0002] User Sync Trigger (October 2024)

**Migration File:** `0002_sync_user_trigger.sql`

**Purpose:** Implements automatic synchronization between Supabase Auth users and application accounts table.

**Changes:**

1. **Dropped old trigger** (if existed):
   ```sql
   DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
   DROP FUNCTION IF EXISTS public.handle_new_user();
   ```

2. **Created improved sync function** `sync_user_to_account()`:
   - Handles both INSERT and UPDATE operations
   - Extracts metadata from `raw_user_meta_data` JSON field
   - Uses UPSERT pattern (INSERT ... ON CONFLICT DO UPDATE)
   - Maps: `display_name`, `name`, `last_name` from user metadata
   - Defaults `display_name` to email username if not provided
   - Security: `SECURITY DEFINER` with proper permissions

3. **Created trigger** `on_auth_user_sync`:
   ```sql
   CREATE TRIGGER on_auth_user_sync
     AFTER INSERT OR UPDATE ON auth.users
     FOR EACH ROW
     EXECUTE FUNCTION public.sync_user_to_account();
   ```

4. **Granted permissions:**
   - `GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role`
   - `GRANT ALL ON public.accounts TO postgres, anon, authenticated, service_role`

**Impact:**
- Every new user created in Supabase Auth automatically gets a corresponding account record
- User profile updates propagate to the accounts table
- Ensures referential integrity for account-based features

**Verification:**
```sql
-- Check if function exists
SELECT EXISTS (
  SELECT 1 FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname = 'sync_user_to_account'
);

-- Check if trigger exists
SELECT EXISTS (
  SELECT 1 FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'auth'
  AND c.relname = 'users'
  AND t.tgname = 'on_auth_user_sync'
);

-- Verify sync
SELECT
  au.id,
  au.email,
  pa.id as account_id,
  pa.email as account_email,
  pa.display_name,
  pa.name,
  pa.last_name
FROM auth.users au
LEFT JOIN public.accounts pa ON au.id = pa.id
ORDER BY au.created_at DESC
LIMIT 5;
```

**Related Files:**
- Function implementation: `src/infra/db/migrations/0002_sync_user_trigger.sql`
- Account schema: `src/infra/db/schemas/accounts.ts`

---

### [0001] Add Last Name to Accounts (October 2024)

**Migration File:** `0001_add_last_name_to_accounts.sql`

**Purpose:** Extends the accounts table to store user's last name separately from the first name.

**Changes:**
```sql
ALTER TABLE "accounts" ADD COLUMN "last_name" text;
```

**Impact:**
- Supports full name display and formatting
- Enables better user profile management
- Used by user sync trigger to map `raw_user_meta_data->>'last_name'`

**Related Files:**
- Migration: `src/infra/db/migrations/0001_add_last_name_to_accounts.sql`
- Schema: `src/infra/db/schemas/accounts.ts`

---

### [0000] Initial Schema (September 2024)

**Migration File:** `0000_mighty_jigsaw.sql`

**Purpose:** Creates the complete initial database schema for Legal Mind after migrating from Convex.

**Enums Created:**

| Enum                    | Values                                                                 |
|-------------------------|------------------------------------------------------------------------|
| `client_status`         | LEAD, PROSPECT, ACTIVE, INACTIVE, ARCHIVED                             |
| `client_type`           | INDIVIDUAL, COMPANY                                                    |
| `deadline_priority`     | LOW, MEDIUM, HIGH, CRITICAL                                            |
| `deadline_status`       | PENDING, IN_PROGRESS, COMPLETED, MISSED, CANCELLED                     |
| `deadline_type`         | HEARING, APPEAL, RESPONSE, PETITION, DOCUMENT, PAYMENT, MEETING, OTHER |
| `notification_channel`  | EMAIL, SYSTEM, PUSH, SMS, WHATSAPP                                     |
| `notification_status`   | PENDING, SENT, DELIVERED, READ, FAILED, CANCELLED                      |
| `process_area`          | CIVIL, CRIMINAL, TRABALHISTA, TRIBUTARIO, ADMINISTRATIVO, etc.         |
| `process_priority`      | LOW, MEDIUM, HIGH, URGENT                                              |
| `process_status`        | PENDING, ACTIVE, SUSPENDED, ARCHIVED, CLOSED                           |
| `profile_type`          | ADMIN, LAWYER, ASSISTANT, CLIENT, PARALEGAL                            |
| `space_role`            | OWNER, ADMIN, LAWYER, ASSISTANT, CLIENT, VIEWER                        |
| `space_type`            | INDIVIDUAL, TEAM, FIRM, DEPARTMENT                                     |

**Tables Created:**

#### `accounts`
Core user accounts table synced with Supabase Auth.
- **Columns:** id (text/UUIDv7), display_name, name, email (unique), timestamps
- **Purpose:** Represents authenticated users in the application
- **Relationships:** Referenced by clients, deadlines, notifications, spaces

#### `clients`
Legal clients (individuals or companies)
- **Columns:** id, account_id, type, status, name, email, phone, tax_id, notes, timestamps
- **Purpose:** Manages client information and relationships
- **Relationships:** Belongs to account; has many processes and deadlines
- **Note:** Originally named "customers" in Convex

#### `processes`
Legal processes
- **Columns:** id, space_id, client_id, cnj, court, title, status, tags (jsonb), archived_at, timestamps
- **Purpose:** Tracks legal cases and proceedings
- **Relationships:** Belongs to space and client; has many deadlines
- **Special:** CNJ is the Brazilian unified process number standard

#### `deadlines`
Task deadlines linked to processes or clients.
- **Columns:** id, account_id, process_id, client_id, title, description, due_at, type, status, priority, google_event_id, completed_at, timestamps
- **Purpose:** Manages time-sensitive tasks and obligations
- **Relationships:** Belongs to account; optionally linked to process and client
- **Integration:** Google Calendar sync via `google_event_id`

#### `notifications`
Notification records across multiple channels.
- **Columns:** id (uuid), account_id, user_id, deadline_id, channel, payload (jsonb), scheduled_at, sent_at, status, error_message, created_at
- **Purpose:** Tracks notification delivery across email, push, SMS, WhatsApp
- **Relationships:** Belongs to account; optionally linked to deadline

#### `spaces`
Multi-tenant workspaces (firms, teams, departments).
- **Columns:** id, name, created_by, timestamps
- **Purpose:** Enables multi-tenancy and team collaboration
- **Relationships:** Created by account; has many processes; many-to-many with accounts

#### `spaces_to_accounts`
Join table for space membership.
- **Columns:** space_id, account_id (composite PK)
- **Purpose:** Associates accounts with spaces for RBAC
- **Relationships:** Links spaces and accounts

#### `profiles`
User profile information (auxiliary table).
- **Columns:** id, email, name, timestamps
- **Purpose:** Extended user profile data (may be deprecated in favor of accounts)

**Foreign Keys:**
- All tables properly constrained with foreign key relationships
- Cascade behavior: `ON DELETE no action ON UPDATE no action` (explicit handling required)

**Notable Design Decisions:**
1. **UUIDv7 as text:** All primary keys use text type to support UUIDv7 generation via `uuidv7()` function
2. **Soft deletes:** All tables include `deleted_at` timestamp for soft delete patterns
3. **Timestamps:** Standardized `created_at`, `updated_at`, `deleted_at` across all tables
4. **JSONB usage:** `tags` in processes, `payload` in notifications for flexible metadata

**Related Files:**
- Migration: `src/infra/db/migrations/0000_mighty_jigsaw.sql`
- Schemas: `src/infra/db/schemas/*.ts`

---

## Migration Workflow

The project uses Drizzle Kit for schema management:

1. **Generate:** `pnpm db:generate` - Create migration files from schema changes
2. **Migrate:** `pnpm db:migrate` - Apply pending migrations to database
3. **Seed:** `pnpm db:seed` - Populate database with test data

See [DATABASE-SETUP.md](./DATABASE-SETUP.md) for operational details.

---

## Future Migrations

Planned schema changes:
- Activity logs table for audit trail
- Enhanced RBAC with role-permission junction table
- Integration tables for DataJud and other external services
- Indexes optimization for query performance

---

## Rollback Strategy

All migrations are tracked in `src/infra/db/migrations/meta/` with JSON snapshots. In case of issues:

1. Database snapshots are maintained in Supabase dashboard
2. Drizzle migrations are reversible via manual SQL or database restore
3. Backups of historical docs available in `/backups/2025-10-19/`

---

## References

- **Migration Files:** `/src/infra/db/migrations/`
- **Schema Definitions:** `/src/infra/db/schemas/`
- **Database Setup Guide:** [DATABASE-SETUP.md](./DATABASE-SETUP.md)
- **RBAC Architecture:** [/docs/RBAC_ARCHITECTURE.md](../RBAC_ARCHITECTURE.md)
- **Project README:** [/README.md](../../README.md)
