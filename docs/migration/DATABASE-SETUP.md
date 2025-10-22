# Database Setup Guide

This guide covers daily operations for database management using Drizzle ORM workflow.

---

## 🚀 Quick Start

### Full Setup (Migrations + Seed)

To apply migrations and populate the database with test data:

```bash
pnpm db:migrate
pnpm db:seed
```

### Fresh Database Reset

To completely reset your local database:

```bash
# For local Supabase
supabase db reset

# Or using Docker
docker compose down -v
docker compose up -d pg
pnpm db:migrate
```

---

## 📋 Prerequisites

1. **Database Running**
   - Local Supabase: `supabase start`
   - Docker: `docker compose up -d pg`

2. **Environment Variables**
   Create `.env.local` with:
   ```bash
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="..."
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="..."
   SUPABASE_SECRET_KEY="..."
   ```

---

## Drizzle Workflow

### 1. Generate Migration (After Schema Changes)

When you modify a Drizzle schema file in `src/infra/db/schemas/`:

```bash
pnpm db:generate
```

This creates a new migration file in `src/infra/db/migrations/` (e.g., `0003_some_change.sql`).

### 2. Apply Migrations

To execute all pending migrations:

```bash
pnpm db:migrate
```

**Applied migrations:**
- `0000_mighty_jigsaw.sql` - Initial schema (tables, enums)
- `0001_add_last_name_to_accounts.sql` - Extends accounts table
- `0002_sync_user_trigger.sql` - User sync trigger (auth.users → accounts)

See [CHANGELOG.md](./CHANGELOG.md) for detailed migration history.

### 3. Seed Database

Populate with test data:

```bash
# Complete seed (users, spaces, clients, processes)
pnpm db:seed

# Or individual entities
pnpm db:seed:users      # 5 users + accounts
pnpm db:seed:spaces     # 3 spaces
pnpm db:seed:clients    # 3-8 clients per account
pnpm db:seed:processes  # 1-5 processes per client
```

**Seed dependency order:**
```
users → spaces
     → clients → processes
```

### 4. Database Studio (Visual Inspection)

Open Drizzle Studio to browse and edit data:

```bash
pnpm db:studio
```

---

## 🔐 Test Credentials

After seeding, log in with:

- **Email:** `john-doe@gmail.com`
- **Password:** `R0A4kP5Af&uCRYUw&K4H`

---

## Creating a New Migration

### Step-by-Step Example

1. **Modify a schema file:**
   ```typescript
   // src/infra/db/schemas/clients.ts
   export const clients = pgTable('clients', {
     // ... existing columns
     website: varchar('website', { length: 255 }), // NEW
   })
   ```

2. **Generate migration:**
   ```bash
   pnpm db:generate
   ```
   
   Drizzle will prompt with a name suggestion. Press Enter or provide a custom name.

3. **Review the generated SQL:**
   ```bash
   cat src/infra/db/migrations/0003_*.sql
   ```

4. **Apply the migration:**
   ```bash
   pnpm db:migrate
   ```

5. **Update TypeScript types (if using Supabase types):**
   ```bash
   pnpm supabase:types
   ```

---

## Troubleshooting

### Database Connection Issues

```bash
# Error: Cannot connect to database
```

**Solutions:**
- Verify database is running: `docker ps` or `supabase status`
- Check `DATABASE_URL` in `.env.local`
- Test connection: `psql $DATABASE_URL`

### Migration Conflicts

```bash
# Error: Migration already applied or conflict detected
```

**Solutions:**
- Check migration history: `pnpm db:studio` → `__drizzle_migrations` table
- Use drift detection: `pnpm db:drift`
- Reset if needed: `supabase db reset`

### User Sync Trigger Not Working

If users aren't syncing to `accounts` table:

```bash
# Re-apply the trigger migration
pnpm db:migrate

# Test with user seed
pnpm db:seed:users
```

**Verify manually:**
```sql
-- Check trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_sync';

-- Check function exists
SELECT proname FROM pg_proc WHERE proname = 'sync_user_to_account';

-- Verify sync
SELECT u.id, u.email, a.id as account_id, a.email as account_email
FROM auth.users u
LEFT JOIN public.accounts a ON u.id = a.id;
```

### Seed Failures

```bash
# Error: Foreign key constraint violation
```

**Solutions:**
- Seeds have dependencies; run in order or use complete seed
- Clean existing data: individual seeds clean their tables automatically
- Check logs for specific errors

---

## Available Commands

| Command               | Description                                     |
|-----------------------|-------------------------------------------------|
| `pnpm db:generate`    | Generate migration from schema changes          |
| `pnpm db:migrate`     | Apply pending migrations                        |
| `pnpm db:seed`        | Seed complete database (all entities)           |
| `pnpm db:seed:users`  | Seed users only                                 |
| `pnpm db:seed:spaces` | Seed spaces only                                |
| `pnpm db:seed:clients`| Seed clients only                               |
| `pnpm db:seed:processes`| Seed processes only                           |
| `pnpm db:studio`      | Open Drizzle Studio (visual DB browser)         |
| `pnpm db:drift`       | Detect schema drift (compare schema vs DB)      |
| `pnpm db:summary`     | Show database summary (counts per table)        |
| `supabase db reset`   | Reset local Supabase database                   |

---

## Best Practices

### Schema Changes

1. **Always generate migrations** instead of manual SQL
2. **Review generated SQL** before applying
3. **Test migrations** on a local database first
4. **Never edit applied migrations** - create a new one instead

### Seeding

1. **Use modular seeds** for specific entity testing
2. **Reset before full seed** to avoid conflicts
3. **Keep test credentials** updated in this guide

### Development Workflow

1. Make schema changes in `src/infra/db/schemas/`
2. Generate migration: `pnpm db:generate`
3. Apply migration: `pnpm db:migrate`
4. Update types: `pnpm supabase:types` (if needed)
5. Seed test data: `pnpm db:seed`
6. Commit migration files with schema changes

---

## References

- **Migration History:** [CHANGELOG.md](./CHANGELOG.md)
- **Schema Files:** `/src/infra/db/schemas/`
- **Migration Files:** `/src/infra/db/migrations/`
- **Seed Files:** `/src/infra/db/seeds/`
- **Drizzle Kit Docs:** https://orm.drizzle.team/kit-docs/overview
