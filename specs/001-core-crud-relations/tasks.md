# Tasks: Core CRUD & Relations (Space-Based Architecture)

Feature Dir: specs/001-core-crud-relations
Branch: 001-core-crud-relations

**Architecture**: Space-scoped entities following repository pattern (Space → Account)

## Phase 1 — Setup & Schema Migration

**Goal**: Update schemas to use `spaceId` FK instead of `accountId`, following Space-based architecture.

- [ ] T001 [CRITICAL] Add `spaceId` column to `clients` table schema in `src/infra/db/schemas/core/clients.ts`
- [ ] T002 [CRITICAL] Add `spaceId` column to `processes` table schema in `src/infra/db/schemas/core/processes.ts`
- [ ] T003 [CRITICAL] Add `spaceId` column to `deadlines` table schema in `src/infra/db/schemas/core/deadlines.ts`
- [ ] T004 Update Client relations in `src/infra/db/schemas/core/clients.relations.ts`
- [ ] T005 Update Process relations in `src/infra/db/schemas/core/processes.relations.ts`
- [ ] T006 Update Deadline relations in `src/infra/db/schemas/core/deadlines.relations.ts`
- [ ] T007 Generate migration for spaceId columns with `pnpm db:generate`
- [ ] T008 Review and apply migration with `pnpm db:migrate`

## Phase 2 — Repository Layer (Client)

**Goal**: Implement repository pattern following `SpaceRepository` and `AccountRepository` examples.

- [ ] T009 Create `ClientRepository` interface in `src/modules/client/repositories/client-repository.ts`
- [ ] T010 Implement `DrizzleClientRepository` in `src/modules/client/repositories/drizzle-client-repository.ts`
- [ ] T011 Create barrel export in `src/modules/client/repositories/index.ts`
- [ ] T012 Create Client factory for tests in `src/modules/client/factories/client.factory.ts`

## Phase 3 — Repository Layer (Process)

- [ ] T013 Create `ProcessRepository` interface in `src/modules/process/repositories/process-repository.ts`
- [ ] T014 Implement `DrizzleProcessRepository` in `src/modules/process/repositories/drizzle-process-repository.ts`
- [ ] T015 Create barrel export in `src/modules/process/repositories/index.ts`
- [ ] T016 Create Process factory for tests in `src/modules/process/factories/process.factory.ts`

## Phase 4 — Repository Layer (Deadline)

- [ ] T017 Create `DeadlineRepository` interface in `src/modules/deadline/repositories/deadline-repository.ts`
- [ ] T018 Implement `DrizzleDeadlineRepository` in `src/modules/deadline/repositories/drizzle-deadline-repository.ts`
- [ ] T019 Create barrel export in `src/modules/deadline/repositories/index.ts`
- [ ] T020 Create Deadline factory for tests in `src/modules/deadline/factories/deadline.factory.ts`

## Phase 5 — Server Actions (Client)

**Goal**: Refactor actions to use repositories and spaceId context.

### Queries
- [ ] T021 Create `get-clients-action.ts` in `src/modules/client/actions/queries/` (list with filters, spaceId scoped)
- [ ] T022 Create `get-client-by-id-action.ts` in `src/modules/client/actions/queries/` (single fetch)

### Mutations
- [ ] T023 Create `insert-client-action.ts` in `src/modules/client/actions/mutations/` (spaceId from context)
- [ ] T024 Create `update-client-action.ts` in `src/modules/client/actions/mutations/`
- [ ] T025 Create `delete-client-action.ts` in `src/modules/client/actions/mutations/` (soft-delete with cascade)

- [ ] T026 Update barrel export in `src/modules/client/actions/index.ts`

## Phase 6 — Server Actions (Process)

### Queries
- [ ] T027 Create `get-processes-action.ts` in `src/modules/process/actions/queries/`
- [ ] T028 Create `get-process-by-id-action.ts` in `src/modules/process/actions/queries/`

### Mutations
- [ ] T029 Create `insert-process-action.ts` in `src/modules/process/actions/mutations/`
- [ ] T030 Create `update-process-action.ts` in `src/modules/process/actions/mutations/`
- [ ] T031 Create `delete-process-action.ts` in `src/modules/process/actions/mutations/` (soft-delete with cascade)

- [ ] T032 Update barrel export in `src/modules/process/actions/index.ts`

## Phase 7 — Server Actions (Deadline)

### Queries
- [ ] T033 Create `get-deadlines-action.ts` in `src/modules/deadline/actions/queries/`
- [ ] T034 Create `get-deadline-by-id-action.ts` in `src/modules/deadline/actions/queries/`

### Mutations
- [ ] T035 Create `insert-deadline-action.ts` in `src/modules/deadline/actions/mutations/`
- [ ] T036 Create `update-deadline-action.ts` in `src/modules/deadline/actions/mutations/`
- [ ] T037 Create `delete-deadline-action.ts` in `src/modules/deadline/actions/mutations/` (soft-delete)

- [ ] T038 Update barrel export in `src/modules/deadline/actions/index.ts`

## Phase 8 — Space Pages (NEW)

**Goal**: Create new pages in `/space/[id]/` following existing pattern.

- [ ] T039 Create search params cache in `src/app/(private)/space/[id]/clientes/search-params.ts`
- [ ] T040 Create Clients list page in `src/app/(private)/space/[id]/clientes/page.tsx`
- [ ] T041 Create DataTableClients component in `src/modules/client/components/data-table-clients.tsx`

- [ ] T042 Create search params cache in `src/app/(private)/space/[id]/processos/search-params.ts`
- [ ] T043 Create Processes list page in `src/app/(private)/space/[id]/processos/page.tsx`
- [ ] T044 Create DataTableProcesses component in `src/modules/process/components/data-table-processes.tsx`

- [ ] T045 Create search params cache in `src/app/(private)/space/[id]/prazos/search-params.ts`
- [ ] T046 Create Deadlines list page in `src/app/(private)/space/[id]/prazos/page.tsx`
- [ ] T047 Create DataTableDeadlines component in `src/modules/deadline/components/data-table-deadlines.tsx`

## Phase 9 — Soft-Delete Cascade

**Goal**: Implement cascade behavior in delete actions.

- [ ] T048 Implement cascade in `delete-client-action.ts` (mark all processes + deadlines)
- [ ] T049 Implement cascade in `delete-process-action.ts` (mark all deadlines)
- [ ] T050 Add tests for cascade behavior

## Phase 10 — Forms & Detail Views (Optional P2)

- [ ] T051 Create Client form component in `src/modules/client/components/client-form.tsx`
- [ ] T052 Create Process form component in `src/modules/process/components/process-form.tsx`
- [ ] T053 Create Deadline form component in `src/modules/deadline/components/deadline-form.tsx`

## Phase 11 — Testing & Polish

- [ ] T054 Add unit tests for repositories
- [ ] T055 Add integration tests for actions
- [ ] T056 Add E2E tests for Space pages
- [ ] T057 Update navigation in Space layout
- [ ] T058 Update quickstart.md with new routes

---

## Dependencies & Execution Order

**Sequential (must follow order)**:
1. Phase 1 (T001-T008): Schema migration MUST be done first
2. Phase 2-4 (T009-T020): Repositories before actions
3. Phase 5-7 (T021-T038): Actions before pages
4. Phase 8 (T039-T047): Pages depend on actions
5. Phase 9 (T048-T050): Cascade depends on all actions

**Parallel Execution**:
- Within Phase 2-4: Client, Process, Deadline repositories can be done in parallel
- Within Phase 5-7: Client, Process, Deadline actions can be done in parallel
- Within Phase 8: All three Space pages can be done in parallel

## Implementation Priority

**MVP (P1)**: T001-T047 + T048-T049
- Schema migration with spaceId
- Repository pattern implementation
- Server actions with Space context
- Space pages with data tables
- Soft-delete cascade

**P2**: T050-T053
- Tests
- Forms for create/edit

**P3**: T054-T058
- Complete test coverage
- Navigation updates
- Documentation

## Key Architectural Decisions

1. **Space-scoped**: All entities have `spaceId` FK, not `accountId`
2. **Repository pattern**: Interface + Drizzle implementation for each entity
3. **Server actions**: Split into `queries/` and `mutations/` directories
4. **Pages in Space**: `/space/[id]/clientes`, not `/dashboard/clients`
5. **Soft-delete**: `deletedAt` timestamp with explicit cascade logic
6. **Context injection**: `spaceId` from route param `[id]`, not from session

