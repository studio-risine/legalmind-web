# Soft-Delete Cascade Implementation

**Feature**: Core CRUD & Relations
**Date**: November 5, 2025
**Status**: Implemented

## Overview

Soft-delete cascade ensures that when a parent entity is deleted (soft-deleted with `deletedAt`), all related child entities are also soft-deleted automatically within a transaction.

## Cascade Hierarchy

```
Client (soft-delete)
  └─> Processes (cascade soft-delete)
       └─> Deadlines (cascade soft-delete)

Process (soft-delete)
  └─> Deadlines (cascade soft-delete)

Deadline (soft-delete)
  └─> No children
```

## Implementation Details

### ClientRepository.delete()

**Cascade flow**:
1. Find all `processes` where `clientId = client.id`
2. For each process, soft-delete all `deadlines` where `processId IN (processIds)`
3. Soft-delete all `processes` where `clientId = client.id`
4. Soft-delete the `client`

**Transaction**: All operations wrapped in `db.transaction()` for atomicity.

**Example**:
```typescript
await clientRepository.delete({
  id: 'client-123',
  spaceId: 'space-456'
})
// Result: Client + all Processes + all Deadlines soft-deleted
```

### ProcessRepository.delete()

**Cascade flow**:
1. Soft-delete all `deadlines` where `processId = process.id`
2. Soft-delete the `process`

**Transaction**: All operations wrapped in `db.transaction()`.

**Example**:
```typescript
await processRepository.delete({
  id: 'process-789',
  spaceId: 'space-456'
})
// Result: Process + all Deadlines soft-deleted
```

### DeadlineRepository.delete()

**No cascade**: Deadlines have no children.

**Example**:
```typescript
await deadlineRepository.delete({
  id: 'deadline-abc',
  spaceId: 'space-456'
})
// Result: Only the Deadline is soft-deleted
```

## Database Schema

The database schema has **hard cascade** (`onDelete: 'cascade'`) as a safety net:

```typescript
// clients.ts
spaceId: text('space_id')
  .references(() => spaces.id, { onDelete: 'cascade' })

// processes.ts
clientId: uuid('client_id')
  .references(() => clients.id, { onDelete: 'cascade' })

// deadlines.ts
processId: uuid('process_id')
  .references(() => processes.id, { onDelete: 'cascade' })
```

**Note**: Hard cascade only triggers on actual DELETE operations. Our soft-delete (UPDATE with deletedAt) requires manual cascade logic in application code.

## Query Safety

All cascade queries include:
- ✅ `spaceId` check for multi-tenancy isolation
- ✅ `isNull(deletedAt)` to avoid re-deleting
- ✅ Transaction for atomicity
- ✅ Timestamp consistency (same `now` for all updates)

## Testing Recommendations

### Unit Tests (Repository Layer)
Mock database and verify:
1. Transaction is called
2. Correct number of queries executed
3. Queries have correct WHERE clauses

### Integration Tests (Actions Layer)
Use test database and verify:
1. Delete client → processes + deadlines deleted
2. Delete process → deadlines deleted
3. Soft-deleted entities excluded from list queries
4. Count of deleted records matches expected

### Example Integration Test Flow
```typescript
// 1. Create test data
const client = await createClient(...)
const process = await createProcess({ clientId: client.id, ... })
const deadline = await createDeadline({ processId: process.id, ... })

// 2. Delete client
await deleteClient({ id: client.id, spaceId: space.id })

// 3. Verify cascade
const foundClient = await getClientById({ id: client.id, spaceId: space.id })
expect(foundClient).toBeUndefined() // soft-deleted

const foundProcesses = await listProcesses({ clientId: client.id, spaceId: space.id })
expect(foundProcesses.total).toBe(0) // soft-deleted

const foundDeadlines = await listDeadlines({ processId: process.id, spaceId: space.id })
expect(foundDeadlines.total).toBe(0) // soft-deleted
```

## Performance Considerations

### Client Deletion
- **Queries**: 1 SELECT (find processes) + 2 UPDATEs (deadlines, processes) + 1 UPDATE (client) = **4 queries**
- **N+1 Risk**: Mitigated by batch UPDATE with `OR` condition
- **Transaction**: Single transaction ensures atomicity

### Process Deletion
- **Queries**: 1 UPDATE (deadlines) + 1 UPDATE (process) = **2 queries**
- **Transaction**: Single transaction ensures atomicity

### Optimization
- Indexes on `clientId`, `processId`, `spaceId`, `deletedAt` recommended
- Consider batch deletion API for bulk operations
- Monitor transaction size for clients with many processes

## Edge Cases Handled

1. ✅ **Already deleted**: `isNull(deletedAt)` prevents re-deletion
2. ✅ **No children**: Empty processIds array handled gracefully
3. ✅ **Space isolation**: All queries scoped to `spaceId`
4. ✅ **Partial failure**: Transaction rollback on error
5. ✅ **Concurrent deletion**: Database-level locking via transaction

## Future Enhancements

- [ ] Soft-delete audit log (track who deleted what)
- [ ] Restore functionality (set `deletedAt = null` with cascade)
- [ ] Permanent deletion after N days (scheduled job)
- [ ] Deletion confirmation UI with cascade preview
- [ ] Metrics: track cascade depth and affected records
