# Research: Core CRUD & Relations

**Feature**: Core CRUD & Relations
**Date**: November 5, 2025 (REVISED)
**Status**: Complete

## Critical Architectural Decision: Space vs Account Scoping

### Decision
All domain entities (Client, Process, Deadline) MUST be scoped to `spaceId`, not `accountId` directly.

### Rationale
1. **Existing Pattern**: Space module already implements this architecture:
   - `spaces` table has `accountId` via `spacesToAccounts` join table
   - `Space` acts as organizational boundary for law firm data
   - Multi-tenant isolation happens at Space level, not Account level

2. **Business Logic**: Space represents a "law firm workspace":
   - Account can have multiple Spaces (e.g., different practice areas)
   - Space-level isolation aligns with constitution principle III (Multi-Tenancy)
   - RBAC enforcement happens at Space membership level

3. **Code Consistency**: Following `DrizzleSpaceRepository` pattern:
   - Repository interface + Drizzle implementation
   - Transaction support for multi-table operations
   - Query builder pattern with typed schemas

### Alternatives Considered
- ❌ **Direct Account scoping**: Would break existing Space architecture and require migration
- ❌ **Dual scoping (spaceId + accountId)**: Redundant; accountId derivable from spaceId
- ✅ **Space scoping only**: Aligns with codebase, simpler queries, clear tenant boundary

### 2) Assignment Model Granularity
- Decision: Assignment at Process level; Deadlines inherit Process assignees with optional per-deadline override (additional assignees).
- Rationale: Keeps default workflow simple (most work organized around processes), while allowing flexibility for specific deadlines.
- Alternatives considered:
  - Only process-level assignments: too rigid for time-sensitive ad-hoc responsibility changes.
  - Only per-deadline assignments: too granular and high maintenance.

## 2. Repository Pattern Implementation

### Decision
Follow existing Space/Account pattern: interface + Drizzle implementation for all domain repositories.

### Rationale
- **Code consistency**: Matches `SpaceRepository` and `AccountRepository` patterns
- **Testability**: Mock interface for unit tests without DB
- **Separation of concerns**: Business logic in actions, data access in repositories
- **Type safety**: Leverages Drizzle's typed query builder

### Implementation Pattern
```typescript
// Interface (e.g., client-repository.ts)
export interface ClientRepository {
  insert(data: InsertClient): Promise<{ clientId: string }>
  findById(params: { id: string; spaceId: string }): Promise<Client | undefined>
  findBySpace(params: { spaceId: string; filters: Filters }): Promise<ClientList>
  update(params: { id: string; data: Partial<Client> }): Promise<void>
  softDelete(params: { id: string; spaceId: string }): Promise<void>
}

// Implementation (e.g., drizzle-client-repository.ts)
export class DrizzleClientRepository implements ClientRepository {
  async findById({ id, spaceId }) {
    return db.query.clients.findFirst({
      where: (clients, { eq, and, isNull }) =>
        and(
          eq(clients.id, id),
          eq(clients.spaceId, spaceId),
          isNull(clients.deletedAt)
        )
    })
  }
}
```

### Alternatives Considered
- ❌ **Direct DB in actions**: Less testable, violates existing pattern
- ❌ **Service layer**: Over-engineering; repository sufficient for CRUD
- ✅ **Repository pattern**: Proven in codebase, clean abstraction

## 3. Soft-Delete Policy

### Decision
Implement soft-delete with `deletedAt` timestamp on all entities, with cascade behavior.

### Rationale
- **Legal compliance**: Brazilian law requires audit trail retention
- **Data recovery**: Accidental deletion recovery
- **Relationship preservation**: No orphaned foreign keys
- **Constitution alignment**: Principle IV (Auditability)

### Cascade Rules
- Delete Client → soft-delete all Processes → soft-delete all Deadlines
- Delete Process → soft-delete all Deadlines
- Delete Deadline → only that Deadline

### Implementation
```sql
-- Schema
deletedAt: timestamp('deleted_at', { withTimezone: true })

-- Query filter (all reads)
WHERE deletedAt IS NULL

-- Soft delete
UPDATE clients SET deletedAt = NOW() WHERE id = ? AND spaceId = ?
```

### Alternatives Considered
- ❌ **Hard delete**: Violates legal requirements
- ❌ **Archive tables**: Complex, hard to query relationships
- ✅ **Soft-delete with cascade**: Industry standard for legal SaaS

## 4. Assignment Granularity

### Decision
DEFER process/deadline assignments to Phase 2 (US3: Role-Based Visibility).

### Rationale
- **P1 scope**: Basic CRUD and relationships
- **P3 feature**: RBAC and assignments belong to US3
- **Simplicity**: Avoid premature optimization

### Future Implementation
- `processAssignments` join table: `{ processId, userId, role }`
- Similar for `deadlineAssignments`
- Visibility rules in repository layer

## 5. Pagination Defaults

### Decision
Default 25 per page, selectable [10, 25, 50, 100], hard max 100.

### Rationale
- **Performance**: Balance query speed vs. user convenience
- **UX**: Legal workflows often review 20-50 items at once
- **Alignment**: Matches TanStack Table best practices

### Implementation
```typescript
// Action signature
async function getClients({
  spaceId,
  page = 1,
  perPage = 25, // max 100
  filters,
  sortBy,
  sortDirection
}): Promise<{ data: Client[], total: number }>
```

## Best Practices Consulted

- **Multi-tenancy**: Space-level isolation with spaceId in all queries
- **Audit trails**: createdAt, updatedAt, createdBy on all entities
- **Accessibility**: ARIA labels, keyboard navigation, empty states
- **Type safety**: Zod schemas + Drizzle inferred types

## Outcomes

All clarifications resolved. Data model, contracts, and tasks assume:
1. ✅ Space-scoped entities (not Account-scoped)
2. ✅ Repository pattern with interface + Drizzle impl
3. ✅ Soft-delete with cascade
4. ✅ Assignments deferred to US3
5. ✅ Pagination: 25 default, 100 max
