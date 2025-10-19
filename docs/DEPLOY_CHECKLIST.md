# Deploy Checklist

Use this checklist before merging and deploying changes related to the Clients schema, migrations, and multi-tenancy.

## Code & Types
- [ ] Ensure all `Customer*` types/imports are replaced with `Client*` (hooks, services, components)
- [ ] Confirm services normalize timestamps (created_at/updated_at → createdAt/updatedAt) or regenerate Supabase types
- [ ] Run linters and tests locally: `npm run ci`
- [ ] Verify no usage of deprecated fields (e.g., `document` → `tax_id`)

## Database
- [ ] Review latest Drizzle migrations (`src/infra/db/migrations`) and apply: `npm run db:migrate`
- [ ] Confirm foreign keys and column types match (e.g., `clients.account_id` → `accounts.id` integer)
- [ ] Sanity-check data after migration (e.g., `status` values, nullability of `created_at`)

## Supabase Types & Policies
- [ ] Regenerate Supabase TS types: `npm run supabase:types` (requires Supabase CLI configured)
- [ ] Implement/verify RLS policies for `clients`, `processes`, `deadlines`, `notifications` using `account_id`
- [ ] Validate role-based access (RBAC) claims and policy conditions

## Configuration & Environment
- [ ] Confirm `.env.local` contains correct DB credentials and Supabase keys
- [ ] Ensure service URLs, JWT settings, and auth configuration are correct for the target environment

## CI/CD
- [ ] Pipeline runs `npm run ci` and `npm run db:migrate` (or migration steps) as required
- [ ] Add checks to prevent committing `customer` terminology (lint rule or CI grep)

## UI/UX (if applicable)
- [ ] Verify list pages and dialogs reflect the new schema (status options, tax_id field)
- [ ] Confirm filters include `account_id` and only show tenant-specific data

## Rollback Plan
- [ ] Snapshot current DB before migration
- [ ] Prepare rollback SQL and strategy if constraints or policies cause issues