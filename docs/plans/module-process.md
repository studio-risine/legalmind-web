# Context
Summary of the repository context and current understanding:
- Tech stack: Next.js (App Router), TypeScript, Drizzle ORM (Postgres), Supabase config present, shadcn/ui, React Query.
- Domain focus: deadlines (core), clients, and upcoming processes module.
- Existing docs: `docs/PROCESS_MODULE_PRD.md` (Process Module PRD), `docs/LEGAL_MANAGEMENT.md`, roadmap phase 02 (clientes e processos), tasks for phase 02, glossary and naming conventions.
- Current DB (Drizzle): `src/infra/db/schemas/processes.ts` defines `processes` with fields: id, account_id, client_id, cnj, court, title, status (default 'ACTIVE'), tags (jsonb), archived_at, timestamps. No participants relation.
- Relations in docs: Process is central; deadlines belong to a process; process belongs to client; multi-tenancy via account_id.
- UI: Placeholder page at `src/app/(private)/dashboard/processes/page.tsx` with header and "New Process" button.
- Types/constants: `src/constants/process.ts` with PROCESS_STATUS/PROCESS_AREAS; `src/modules/process/types/*` are mostly placeholders, indicating the module is not implemented yet.

Notable gaps:
- No join table for process participants (N:N users ⟷ processes) although docs mention multiple assigned users/lawyers.
- No actions/services for processes; only placeholders exist.
- PRD and roadmap reference CRUD, filters, and validations (CNJ), but code is not wired.

## Problem
Clear problem/need description:
We must plan the Process module delivery end-to-end: align roadmap goals, validate and adjust the schema (especially to support multiple user participants), define guest CRUD behavior and RBAC, estimate delivery time, and break down the work into tractable issues. Implementation is out of scope now, but issues should include enough detail (contracts, acceptance criteria, and reference snippets) to unblock execution.

## Alternatives
### Alternative 1 — Join table for participants (process_participants)
Pros:
- Normalized N:N relationship, efficient queries and indexing.
- Fine-grained roles/permissions per participant (e.g., OWNER, LAWYER, ASSISTANT, GUEST).
- Scales for reporting, auditing, and constraints.
Cons:
- Requires an extra table and migrations.

### Alternative 2 — Array/JSONB field on processes (participants: uuid[] or jsonb)
Pros:
- Simpler migration; single-table update.
- Fewer joins for basic reads.
Cons:
- Harder to enforce constraints and roles per participant.
- Indexing and filtering by participant becomes awkward and slower.
- Poor fit for RBAC and audit needs.

✅ Chosen approach
Justification:
Use a dedicated join table `process_participants` to model N:N between `users` and `processes`, with explicit role and permission fields. This aligns with the PRD (audit trail, RBAC), scales better, and keeps the schema consistent with other modules.

## Tasks
- [ ] Define DB schema for participants (process_participants)
  - Description: Create a join table for N:N association between processes and users with per-participant role.
  - Objective: Support multiple user participants per process, including guests.
  - Acceptance Criteria: Table `process_participants(process_id, user_id, role, invited_by, invited_at, removed_at)` com PK composta (process_id, user_id); FK para `processes.id` e FK para `public.profiles.id` (proxy 1:1 de `auth.users`) em `user_id` e `invited_by`; índices por (user_id), (process_id, role); enum role inclui OWNER, LAWYER, ASSISTANT, GUEST; isolamento de tenant via `account_id` (ou garantido pelo processo); migration Drizzle preparada.
  - Dependencies: Proxy por `public.profiles` sincronizado com `auth.users`.
  - Verification Steps: Migrate locally; validate inserts for multiple participants; query by process_id and by user_id.

- [ ] Align processes schema with PRD and roadmap
  - Description: Review `processes` fields vs PRD (area, status enums; case_number (CNJ) uniqueness; parties structure; optional metadata).
  - Objective: Ensure minimum useful fields for v1 and indexing as per roadmap.
  - Acceptance Criteria: `processes.cnj` unique per account; adicionar coluna `area` (varchar/enum) obrigatória no v1; índices por (account_id, status), (account_id, client_id), e (account_id, area); `status` valores alinhados com constants; minimal nullable fields documentados; sem quebra para consumidores atuais.
  - Dependencies: Existing constants in `src/constants/process.ts`, current Drizzle setup.
  - Verification Steps: Generate SQL and ensure unique index on (account_id, cnj); run a basic query plan for filters.

- [ ] Define RBAC and guest CRUD policy for processes
  - Description: Specify who can create/read/update/delete processes, including guest capabilities.
  - Objective: Enforce multi-tenancy and roles.
  - Acceptance Criteria: Policy matrix documentada: ADMIN/OWNER CRUD completo; LAWYER/ASSISTANT CRUD dentro da account; GUEST com CRUD completo nos processos em que for participante (via `process_participants`); GUEST não gerencia participantes; todas ações escopadas por `account_id` e participação; auditoria gerada para C/U/D.
  - Dependencies: RBAC doc `docs/RBAC_ARCHITECTURE.md` and auth context.
  - Verification Steps: Unit tests/specs for decision points; example server action guards.

- [ ] Actions/Services for processes (server actions)
  - Description: Implement server actions for create, update, delete, get, list; include guest-specific guards.
  - Objective: Provide a typed API surface for the UI and tests.
  - Acceptance Criteria: Functions: `createProcess`, `updateProcess`, `deleteProcess`, `getProcessById`, `listProcesses` com inputs/outputs validados via zod; validação CNJ; paginação por cursor; filtros por status/area/client/court/cnj; regras permitem GUEST deletar/atualizar/criar quando for participante; snippets de referência inclusos nas issues.
  - Dependencies: DB schema readiness, RBAC policy.
  - Verification Steps: Vitest for happy path and guard failures; smoke test via minimal script.

- [ ] UI pages: Processes list and form
  - Description: Build pages under `/dashboard/processes` with list and create/edit forms using existing components.
  - Objective: Enable basic CRUD UX with filters and masks.
  - Acceptance Criteria: Lista com filtros (status, client, area, cnj); formulário com campo `area` + máscara/validação de CNJ; exibe participantes e permite convidar usuários (join table); respeita RBAC (GUEST com CRUD completo apenas nos processos em que participa; sem gerenciar participantes).
  - Dependencies: Actions/services; constants; utils for masks/validation.
  - Verification Steps: Manual E2E run; snapshot tests for components (optional).

- [ ] Audit trail for processes
  - Description: Log create/update/delete events with who and what changed.
  - Objective: Provide compliance traceability.
  - Acceptance Criteria: Records in activity log table or equivalent; linked to process_id and user_id; accessible in UI or via API.
  - Dependencies: Existing logging mechanism if any.
  - Verification Steps: Create/update/delete and verify entries.

- [ ] Documentation and contracts
  - Description: Finalize API contracts (aligned with PRD) and update docs.
  - Objective: Keep team aligned and speed up implementation.
  - Acceptance Criteria: Updated `docs/PROCESS_MODULE_PRD.md` sections (if needed), new RBAC policy appendix, zod schema references in repo; link from README/roadmap.
  - Dependencies: Above tasks.
  - Verification Steps: Docs PR reviewed and approved.

## Risks & Mitigations
- Schema drift between Drizzle and Supabase types (legacy): Mitigate by generating fresh types from Drizzle and updating consumers; add a migration note.
 - Proxy `public.profiles` 1:1 com `auth.users`: garantir sincronização (trigger/função Supabase). Se profiles ainda não existir, criar tabela mínima e planejar sincronização.
- Guest permissions ambiguity: We constrain guest to Create/Read/Update only within invited processes and explicitly forbid delete/participant management.
- Index bloat with many filters: Start with (account_id, cnj unique), (account_id, status), (account_id, client_id); revisit after usage.

## Saving
- Save this plan at: docs/plans/module-process.md
