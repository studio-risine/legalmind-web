# Quickstart: Core CRUD & Relations (Space-Based)

This guide shows how to try the Clients, Processes, and Deadlines flows within a Space context.

**Architecture Note**: All entities are scoped to a Space (not Account directly). Follow the existing Space pattern in the codebase.

## Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for local PostgreSQL) or Supabase configured
- Existing Space setup (via `/space/[id]` routes)

## Setup

1) Install dependencies
```bash
pnpm install
```

2) Start database (Docker local)
```bash
docker compose up -d
```

3) Apply migrations with Space-scoped schemas
```bash
pnpm db:migrate
```

4) Verify schemas include spaceId FK:
```bash
pnpm db:studio
# Check that clients, processes, deadlines tables have spaceId column
```

5) Start the app
```bash
pnpm dev
```

## Repository Pattern

Each domain entity follows this structure:

```
src/modules/{entity}/
├── repositories/
│   ├── {entity}-repository.ts           # Interface
│   └── drizzle-{entity}-repository.ts   # Drizzle implementation
├── actions/
│   ├── queries/                          # Read operations
│   └── mutations/                        # Write operations
├── components/
│   └── data-table-{entities}.tsx        # TanStack Table
└── factories/
    └── {entity}.factory.ts              # Test factories
```

## Try the Flows

### 1. Navigate to a Space
```
http://localhost:3000/space/{spaceId}
```

### 2. Create Client → Process → Deadline
- Go to `/space/{spaceId}/clientes` → Create client
- Go to `/space/{spaceId}/processos` → Create process (linked to client)
- Go to `/space/{spaceId}/prazos` → Create deadline (linked to process)

### 3. Test List Views
- Apply filters: status, priority, date ranges
- Test sorting: by name, createdAt, dueDate
- Verify pagination: 25 default, max 100

### 4. Soft-Delete Cascade
- Delete a Client → verify all Processes + Deadlines soft-deleted
- Delete a Process → verify all Deadlines soft-deleted
- Verify `deletedAt` timestamp in database

### 5. Multi-Tenant Isolation
- Create second Space with different spaceId
- Verify entities from Space A not visible in Space B
- Check database queries filter by `spaceId`

## Testing Server Actions

```typescript
// Example: Create client in Space
import { insertClientAction } from '@modules/client/actions'

const result = await insertClientAction({
  name: 'João Silva',
  type: 'INDIVIDUAL',
  documentNumber: '12345678900', // CPF
  status: 'ACTIVE'
})
// spaceId injected from session context
```

## Database Verification

```sql
-- Check Space isolation
SELECT * FROM core.clients WHERE space_id = 'your-space-id';

-- Check soft-delete
SELECT * FROM core.clients WHERE deleted_at IS NULL;

-- Check cascade
SELECT
  c.name as client,
  p.title as process,
  d.due_date as deadline
FROM core.clients c
LEFT JOIN core.processes p ON p.client_id = c.id
LEFT JOIN core.deadlines d ON d.process_id = p.id
WHERE c.space_id = 'your-space-id'
  AND c.deleted_at IS NULL
  AND p.deleted_at IS NULL
  AND d.deleted_at IS NULL;
```

## Notes

- **Space-scoped**: All entities MUST have valid spaceId (FK to spaces table)
- **Repository pattern**: Follow `SpaceRepository` / `AccountRepository` examples
- **Soft-delete**: `deletedAt` timestamp, cascade to children
- **Pagination**: Default 25, max 100 per page
- **Audit**: createdAt, updatedAt on all entities
- **RBAC**: Deferred to US3 (P3 priority)

## Common Issues

1. **"spaceId required"**: Ensure user session has valid Space membership
2. **"Client not found"**: Check spaceId matches + deletedAt IS NULL
3. **"Foreign key violation"**: Ensure parent exists in same Space
4. **"Cascade not working"**: Implement in delete actions (not DB-level CASCADE)
