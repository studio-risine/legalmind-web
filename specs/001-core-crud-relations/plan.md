# Implementation Plan: Core CRUD & Relations

**Branch**: `001-core-crud-relations` | **Date**: November 5, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-crud-relations/spec.md`

**Note**: This plan has been REVISED to align with the Space-based architecture pattern used in the codebase.

## Summary

Implement core CRUD operations for Clients, Processes, and Deadlines within the Space context, following the repository pattern already established in the codebase. All entities must be scoped to a Space (not Account directly), following the existing pattern where Space acts as the organizational boundary for law firm data.

**Key Architectural Change**: Entities belong to Space → Space belongs to Account, not Entities → Account directly.

## Technical Context

**Language/Version**: TypeScript 5 (Next.js 15, React 19)
**Primary Dependencies**: Next.js App Router, Drizzle ORM, TanStack Table, Zod validation, Supabase Auth
**Storage**: PostgreSQL via Supabase with Drizzle ORM typed queries
**Testing**: Vitest + Testing Library for unit and integration tests
**Target Platform**: Web application (SSR + Client components)
**Project Type**: Full-stack web application with backend (Next.js server actions) and frontend (React)
**Performance Goals**: List queries <1s, mutations <500ms, pagination support (25 default, 100 max)
**Constraints**: Multi-tenant isolation via spaceId, soft-delete with deletedAt timestamp, RBAC enforcement
**Scale/Scope**: Multi-tenant SaaS, 100+ law firms, 10k+ processes per space

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Deadline Management** | ✅ PASS | Implements deadline CRUD with space isolation, priority, status tracking |
| **II. Process, Client & Financial Org** | ✅ PASS | Establishes Client→Process→Deadline relationships within Space context |
| **III. Multi-Tenancy, RBAC & Data Isolation** | ✅ PASS | All entities scoped to Space; Space-to-Account relationship ensures isolation |
| **IV. Notification & Auditability** | ⚠️ DEFER | Audit fields (createdAt, updatedAt) present; notifications deferred to US2/US3 |
| **V. Modern UX & Retention** | ✅ PASS | TanStack Table with filters, pagination, modern Next.js UI |

**Overall**: PASS with deferral on notifications (out of scope for P1)

## Project Structure

### Documentation (this feature)

```text
specs/001-core-crud-relations/
├── plan.md              # This file (REVISED for Space architecture)
├── research.md          # Phase 0 output - architectural decisions
├── data-model.md        # Phase 1 output - entity relationships
├── quickstart.md        # Phase 1 output - setup instructions
├── contracts/           # Phase 1 output - API contracts
│   └── openapi.yaml
└── tasks.md             # Phase 2 output - task breakdown
```

### Source Code (repository root)

```text
src/
├── infra/db/schemas/core/
│   ├── clients.ts           # Client table (spaceId FK)
│   ├── processes.ts         # Process table (spaceId FK, clientId FK)
│   ├── deadlines.ts         # Deadline table (spaceId FK, processId FK)
│   ├── clients.relations.ts
│   ├── processes.relations.ts
│   ├── deadlines.relations.ts
│   └── enums.ts             # Status/Priority enums
│
├── modules/
│   ├── client/
│   │   ├── repositories/
│   │   │   ├── client-repository.ts           # Interface
│   │   │   └── drizzle-client-repository.ts   # Implementation
│   │   ├── actions/
│   │   │   ├── queries/
│   │   │   │   ├── get-clients-action.ts
│   │   │   │   └── get-client-by-id-action.ts
│   │   │   └── mutations/
│   │   │       ├── insert-client-action.ts
│   │   │       ├── update-client-action.ts
│   │   │       └── delete-client-action.ts
│   │   ├── components/
│   │   │   └── data-table-clients.tsx
│   │   └── factories/
│   │       └── client.factory.ts
│   │
│   ├── process/
│   │   ├── repositories/
│   │   │   ├── process-repository.ts
│   │   │   └── drizzle-process-repository.ts
│   │   ├── actions/
│   │   │   ├── queries/
│   │   │   └── mutations/
│   │   ├── components/
│   │   │   └── data-table-processes.tsx
│   │   └── factories/
│   │       └── process.factory.ts
│   │
│   └── deadline/
│       ├── repositories/
│       │   ├── deadline-repository.ts
│       │   └── drizzle-deadline-repository.ts
│       ├── actions/
│       │   ├── queries/
│       │   └── mutations/
│       ├── components/
│       │   └── data-table-deadlines.tsx
│       └── factories/
│           └── deadline.factory.ts
│
└── app/(private)/space/[id]/
    ├── clientes/page.tsx           # Clients list
    ├── processos/page.tsx          # Processes list
    └── prazos/page.tsx             # Deadlines list
```

**Structure Decision**: Follow the existing Space-based module pattern where:
1. All domain entities (Client, Process, Deadline) have `spaceId` foreign key
2. Repository pattern separates interface from Drizzle implementation
3. Actions split into queries/ and mutations/ directories
4. Pages live under `/space/[id]/` routes, not `/dashboard/`
5. Components are co-located with their domain modules

## Complexity Tracking

> **Repository Pattern Justification**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Repository Pattern | Existing codebase pattern; consistency across Space, Account, and domain modules | Direct DB access in actions would break abstraction, make testing harder, and violate established patterns |
| Space-scoped entities | Multi-tenancy isolation; aligns with existing architecture | Account-scoped would duplicate logic and break Space organizational model |

**Note**: These are not violations but architectural decisions that increase complexity with clear justification aligned with constitution principles II and III.
