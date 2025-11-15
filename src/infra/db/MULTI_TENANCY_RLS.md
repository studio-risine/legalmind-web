# Multi-tenancy & Row Level Security (RLS)

## Overview

The legal process management system uses `space_id` (organization_id equivalent) for multi-tenant isolation. All core tables include `spaceId` and must enforce RLS policies to ensure users only access data within their authorized organization.

## Tenant Isolation

- **Tenant Identifier**: `space_id` (references `spaces.id`)
- **All core tables** include `spaceId` for filtering:
  - `processes`
  - `deadlines`
  - `alerts`
  - `documents`
  - `process_events`
  - `audit_logs`
  - `clients`

## RLS Policies (Supabase)

### Authentication
- Use Supabase Auth for user authentication
- User metadata includes `space_id` claim
- All queries automatically filter by authenticated user's `space_id`

### Policy Examples

```sql
-- Example: processes table RLS policy
CREATE POLICY "Users can view processes in their space"
ON processes FOR SELECT
USING (space_id IN (
  SELECT space_id FROM spaces_to_accounts
  WHERE account_id = auth.uid()
));

CREATE POLICY "Users can insert processes in their space"
ON processes FOR INSERT
WITH CHECK (space_id IN (
  SELECT space_id FROM spaces_to_accounts
  WHERE account_id = auth.uid()
  AND role IN ('SUPER_ADMIN', 'ADMIN', 'LAWYER')
));

-- Replicate for UPDATE, DELETE with appropriate role checks
```

### RBAC Roles
- **SUPER_ADMIN**: Full CRUD on all entities across spaces (typically platform admin)
- **ADMIN**: Full CRUD within assigned space(s)
- **LAWYER**: Read all, Create/Update own processes and related entities (deadlines, documents, events)

## Application Layer

- **Drizzle ORM** queries should always include `.where(eq(table.spaceId, currentUserSpaceId))`
- **Server Actions** must validate `space_id` matches authenticated user's space
- **API Routes** must enforce RLS through Supabase client configured with user JWT

## Migration Strategy

1. Ensure all new tables have `space_id` column
2. Create RLS policies in Supabase dashboard or via migration scripts
3. Test policies with different user roles (SUPER_ADMIN, ADMIN, LAWYER)
4. Enable RLS on all tables: `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`

## Notes

- **Soft Deletes**: Use `deletedAt` timestamp instead of hard deletes to maintain audit trail
- **Audit Logs**: All mutations (CREATE, UPDATE, DELETE, ARCHIVE) should write to `audit_logs` table
- **Process Archiving**: Archived processes (`status=ARCHIVED`) trigger alert mode change to `REDUCED`
