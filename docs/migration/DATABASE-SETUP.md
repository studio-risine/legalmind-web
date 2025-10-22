# Database Setup Guide (Drizzle Workflow)

This guide explains how to set up and seed the database using the standard Drizzle workflow.

## 🚀 Quick Start

### Full Setup (Migrations + Complete Seed)

To migrate the schema and seed the database with complete test data (users, spaces, clients, processes):

```bash
pnpm db:setup
```

This command is a shortcut for:
1. `pnpm db:migrate`
2. `pnpm db:seed`

### Test User Sync Only

To test only the user synchronization trigger (INSERT + UPDATE):

```bash
pnpm db:migrate
pnpm db:seed:users
```

This creates 3 test users and verifies the `auth.users` → `public.accounts` synchronization works correctly.

## 📋 Prerequisites

1.  **Database Running**: Your PostgreSQL database must be running. If using Supabase locally, run `supabase start`.
2.  **Environment Variables**: Ensure a `.env.local` file exists with the required variables (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SCRET_KEY`).

## Drizzle Workflow Explained

The project uses a `generate` -> `migrate` -> `seed` workflow.

### 1. `pnpm db:generate` (For Developers)

**When to use**: When you change a Drizzle schema file (in `src/infra/db/schemas`).

This command compares your Drizzle schema with the database state and automatically generates a new `.sql` migration file in `src/infra/db/migrations`.

```bash
# Example: After changing a schema
pnpm db:generate
```
This will create a new file like `src/infra/db/migrations/0003_some_change.sql`.

### 2. `pnpm db:migrate`

**When to use**: To apply all pending migrations to your database.

This command executes all `.sql` files in the migrations folder that have not yet been applied. This is the standard way to update your database schema.

Our project has these migrations:
- `0000_...`: Creates all tables and enums.
- `0001_...`: Adds `last_name` column to `accounts` table.
- `0002_...`: Creates the `sync_user_to_account()` function and trigger to sync `auth.users` with `public.accounts` (handles INSERT and UPDATE).

### 3. `pnpm db:seed`

**When to use**: To populate your database with complete test data.

This command runs the `src/infra/db/seed.ts` script, which:
1.  Deletes all existing data from tables and auth users.
2.  Creates 5 new users via the Supabase Auth API.
3.  The trigger from migration `0002` automatically populates the `accounts` table.
4.  Creates associated spaces, clients, and processes.

### 4. `pnpm db:seed:users` (New!)

**When to use**: To test only the user synchronization feature.

This command runs the `src/infra/db/seed-users.ts` script, which:
1.  Cleans only users and accounts (leaves other data intact).
2.  Creates 3 test users with different metadata scenarios.
3.  Tests INSERT synchronization.
4.  Tests UPDATE synchronization by modifying one user.
5.  Displays detailed logs and verification results.

## 🔐 Test Credentials

### Full Seed (`pnpm db:seed`)

After running the complete seed, you can log in with:

-   **Email**: `john-doe@gmail.com`
-   **Password**: `R0A4kP5Af&uCRYUw&K4H`

After running the user-only seed, you can test with:
-   **Email**: `john.doe@example.com`
-   **Password**: `TestPassword123!`
-   *(Also: jane.smith@example.com and bob.johnson@example.com with the same password)*

## Resetting the Database
To completely reset your local database and start fresh:

```bash
# For local Supabase development
supabase db reset

# Then, re-apply migrations and seed
pnpm db:setup
```
The `supabase db reset` command will wipe your local database and automatically re-apply all migrations from the `supabase/migrations` folder. After that, you can run `pnpm db:seed` if needed, or use the new `db:setup` for both.

## Troubleshooting
-   **"Error: Cannot connect to database"**: Make sure your database is running (`supabase start`) and `DATABASE_URL` in `.env.local` is correct.
-   **"Accounts table is empty after seed"**: The trigger is likely missing or failed. Run `pnpm db:seed:users` to test the trigger in isolation and see detailed logs.
-   **"User already exists"**: The seed script is designed to clean old users first. If this error persists, check the `SUPABASE_SCRET_KEY` in `.env.local`.
-   **"Trigger not working after UPDATE"**: Run `pnpm db:seed:users` to specifically test UPDATE synchronization. The script will show if the trigger is working for both INSERT and UPDATE operations.

## Verifying User Sync

To manually verify the trigger is working, you can query the database:

```sql
-- Check if trigger exists
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_sync';

-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'sync_user_to_account';

-- Verify synchronization between auth.users and accounts
SELECT
  u.id,
  u.email as auth_email,
  u.raw_user_meta_data->>'display_name' as auth_display_name,
  u.raw_user_meta_data->>'name' as auth_name,
  u.raw_user_meta_data->>'last_name' as auth_last_name,
  a.email as account_email,
  a.display_name as account_display_name,
  a.name as account_name,
  a.last_name as account_last_name
FROM auth.users u
LEFT JOIN public.accounts a ON u.id = a.id;
```
