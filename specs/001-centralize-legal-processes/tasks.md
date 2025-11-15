# Tasks - Centralizacao Integrada de Processos Juridicos

Date: 2025-11-08
Branch: 001-centralize-legal-processes
Spec: ./spec.md
Plan: ./plan.md

Context: Personas (Advogado Titular, Associado/Estagiario, Assistente Juridico, Gestor) e fluxos (Importacao, Atualizacao Automatica, Operacao Diaria, Encerramento) orientam as fases abaixo. As tarefas estao organizadas por historias de usuario para permitir entrega e testes independentes.

## Phase 1 - Setup

- [x] T001 Ensure environment variables and Supabase keys documented in .env.example and validated in src/infra/env.ts
- [x] T002 Create CNJ validation utility in src/libs/parsers.ts (validate CNJ format; reuse constants in src/constants/cnj-mappings.ts)
- [x] T003 Add shared Zod schemas for processo/prazo/documento in src/libs/zod/process.ts
- [x] T004 [P] Create shadcn/ui building blocks for tabs and tables in src/components/ui/tabs and src/components/table/
- [x] T005 Define navigation route for process module: src/app/(private)/process/route.md (doc) and index stub in src/app/(private)/process/page.tsx
- [x] T006 Configure storage constraints (25MB, mime whitelist) in src/libs/supabase/storage.ts
- [x] T007 Lint rules and Vitest setup verification (biome.json, vitest.config.ts) - update if needed

## Phase 2 - Foundational

- [x] T008 Create Drizzle schema for Processo in src/infra/db/schema/process.ts
- [x] T009 Create Drizzle schema for Prazo and Alerta in src/infra/db/schema/deadline.ts
- [x] T010 Create Drizzle schema for Documento in src/infra/db/schema/document.ts
- [x] T011 Create Drizzle schema for Andamento (historico) in src/infra/db/schema/event.ts
- [x] T012 [P] Create Drizzle schema for Partes/Clientes vinculo em src/infra/db/schema/party.ts e process_clients.ts
- [x] T013 [P] Create Drizzle schema for Auditoria em src/infra/db/schema/audit.ts
- [x] T014 Add space_id and RLS policies notes in src/infra/db/README.md (multi-tenant)
- [x] T015 Implement audit log helper in src/shared/errors/ and src/modules/process/audit.ts (record actor, action, entity)
- [x] T016 [P] Create server action scaffold in src/modules/process/actions.ts (create, importCNJ, importCSV)
- [x] T017 [P] Create read/query helpers in src/modules/process/queries.ts (getById, listByStatus)
- [x] T018 Add error boundary and toasters for module pages in src/app/(private)/process/layout.tsx

## Phase 3 - User Story 1 (P1): Capturar e Centralizar Processos

Goal: Cadastrar/importar processos (CNJ e CSV), consolidar metadados basicos e exibir visao unica (aba Resumo).
Independent test criteria: Ao cadastrar/importar um processo, a aba Resumo exibe metadados (partes, classe, vara) e status inicial; deduplicacao por CNJ garante registro unico por organizacao.

- [x] T019 [US1] Implement createProcess (manual) in src/modules/process/actions.ts (validar CNJ, unicidade por org, consolidar metadados)
- [x] T020 [US1] Implement importByCNJ in src/modules/process/actions.ts (consulta externa via adapter, normalizacao)
- [x] T021 [US1] Implement importCSV parser in src/modules/process/actions.ts (esquema: numero_processo_cnj, parte_principal, classe?, vara?, data_distribuicao?)
- [x] T022 [US1] Add process overview UI (Resumo tab) in src/app/(private)/process/[id]/_tabs/resumo.tsx
- [x] T023 [US1] Create detail route page in src/app/(private)/process/[id]/page.tsx with Tabs (Resumo, Atividades, Historico)
- [x] T024 [P] [US1] Create process list/index in src/app/(private)/process/page.tsx (filtros por status: ativo, arquivado)
- [ ] T025 [US1] Wire Zod forms for create/import in src/app/(private)/process/_components/process-import-form.tsx
- [ ] T026 [US1] Persist auditoria: criacao de processo em src/modules/process/audit.ts
- [ ] T027 [US1] Export resumido (CSV/PDF) em src/modules/process/export.ts (CSV default, PDF consolidado)
- [ ] T028 [US1] API handlers (if REST used) in src/app/api/processes/route.ts (POST, GET)

## Phase 4 - User Story 2 (P2): Gerir Prazos com Alertas

Goal: Listar, criar e concluir prazos; configurar alertas com antecedencia padrao de 5 dias (configuravel).
Independent test criteria: Ao criar prazos e configurar alertas, o sistema dispara notificacoes internas no limite; conclusao muda estado e remove da lista de pendentes.

- [ ] T029 [US2] Create deadline CRUD server actions in src/modules/deadline/actions.ts (create, listByProcess, complete)
- [ ] T030 [US2] Add critical threshold config (default 5) in src/modules/deadline/config.ts
- [ ] T031 [US2] UI for deadlines list and filters in src/app/(private)/process/[id]/_tabs/atividades.tsx
- [ ] T032 [US2] Notification scheduling for alerts in src/modules/notification/alerts.ts (in-app + digest diario)
- [ ] T033 [US2] Auditoria de conclusao de prazo em src/modules/deadline/audit.ts
- [ ] T034 [P] [US2] API handlers for deadlines in src/app/api/processes/[id]/deadlines/route.ts (GET, POST)

## Phase 5 - User Story 3 (P3): Organizacao Documental

Goal: Upload e classificacao de documentos por processo; busca por titulo/categoria.
Independent test criteria: Upload de PDF (ate 25MB) com categoria; documento aparece listado e e recuperavel por busca.

- [ ] T035 [US3] Implement document register action in src/modules/process/documents.ts (metadata + storage path)
- [ ] T036 [US3] Upload UI component em src/app/(private)/process/[id]/_components/document-upload.tsx (pdf, docx, png, jpg)
- [ ] T037 [US3] Documents list and search in src/app/(private)/process/[id]/_tabs/atividades.tsx (associacao a atividades)
- [ ] T038 [US3] API handlers for documents in src/app/api/processes/[id]/documents/route.ts (GET, POST)
- [ ] T039 [US3] Auditoria de upload de documento em src/modules/process/audit.ts

## Phase 6 - User Story 4 (P4): Visibilidade Operacional e Auditoria

Goal: Painel por processo (fases, prazos criticos, documentos recentes) e trilha de auditoria consultavel.
Independent test criteria: Painel exibe contadores agregados; auditoria lista eventos com ator, horario e entidade; filtros funcionam.

- [ ] T040 [US4] Implement per-process dashboard service in src/modules/process/dashboard.ts (agregacoes)
- [ ] T041 [US4] Dashboard UI em src/app/(private)/process/[id]/_tabs/resumo.tsx (cards + indicadores)
- [ ] T042 [US4] Audit trail query e filtros em src/modules/process/audit.ts (por periodo, entidade)
- [ ] T043 [US4] Audit trail UI em src/app/(private)/process/[id]/_tabs/historico.tsx
- [ ] T044 [P] [US4] Printable report in src/app/(private)/process/[id]/_components/printable-report.tsx (RF11)

## Phase 7 - User Story 5 (P5): Atualizacao Automatica de Andamentos

Goal: Job agendado consulta fontes externas e insere novos andamentos na timeline; marca "novo" ate visualizacao; notifica mudancas de fase.
Independent test criteria: Ao simular retorno externo, eventos aparecem ordenados cronologicamente e marcados como “novo”; ao abrir a timeline, eventos mudam para visto=true.

- [ ] T045 [US5] Create external adapter in src/modules/process/integrations/cnj-adapter.ts (consulta por CNJ + normalizacao)
- [ ] T046 [US5] Implement cron job entry in src/modules/notification/cron.ts (diario, retry/backoff)
- [ ] T047 [US5] Upsert events into timeline in src/modules/process/events.ts (ordenado, sem duplicar por external_ref)
- [ ] T048 [US5] Mark event as viewed action + API in src/app/api/events/[eventId]/view/route.ts (POST)
- [ ] T049 [US5] Notify phase changes/intimacoes in src/modules/notification/phase-changes.ts (in-app; push/e-mail opcional posterior)

## Phase 8 - Encerramento e Regras de Negocio

- [ ] T050 Implement status machine in src/modules/process/status.ts (Ativo, Suspenso, Baixa provisoria/definitiva, Encerrado)
- [ ] T051 Enforce activity blocks on Encerrado in src/modules/process/guards.ts (impedir novas atividades/honorarios)
- [ ] T052 Auto-tagging de fase (etiquetas) em src/modules/process/tags.ts e UI para etiquetas em src/app/(private)/process/[id]/_components/tags.tsx
- [ ] T053 Apensamento de processos em src/modules/process/append.ts e UI em src/app/(private)/process/[id]/_components/append-modal.tsx (RF12)
- [ ] T054 Busca global (processo/parte/etiqueta) em src/app/(private)/search/page.tsx e servico em src/modules/process/search.ts (RF13)

## Final Phase - Polish & Cross-Cutting

- [ ] T055 Empty/error states e toasts consistentes em src/components/ui/
- [ ] T056 A11y: aria-labels, foco e navegacao por teclado nas abas e listas em src/app/(private)/process/[id]/_tabs/
- [ ] T057 Observabilidade: logs estruturados para integracoes e jobs em src/libs/utils.ts
- [ ] T058 Internationalization hooks (pt-BR default) em src/libs/i18n.ts (strings das abas e botoes)
- [ ] T059 Performance: virtualizacao de listas > 1k itens em src/components/table/

## Dependencies (Story Order & Graph)

Order: US1 -> (US2 || US3) -> US4 -> US5.
- US1 e base (Processo criado/visualizado).
- US2 (Prazos) e US3 (Documentos) podem seguir em paralelo apos US1.
- US4 depende de dados de US1–US3 (dashboard/auditoria).
- US5 pode iniciar apos esquema de Andamento (T011) e adapter inicial (pode evoluir em paralelo com US2/US3).

## Parallel Execution Examples

- Em US1: T024 (lista) pode seguir em paralelo a T019–T021 (acoes) e T022 (UI Resumo) [P].
- Em US2: T034 (API deadlines) paralelo a T029–T033 [P].
- Em US4: T044 (relatorio) paralelo a T040–T043 [P].
- Fundacional: T012 e T013 em paralelo [P].

## Implementation Strategy (MVP-first)

- MVP = US1 completo (cadastro/importacao + Resumo) com auditoria e deduplicacao.
- Incremento 2 = US2 (prazos + alertas) e US3 (documentos) em paralelo.
- Incremento 3 = US4 (dashboard/auditoria UI).
- Incremento 4 = US5 (atualizacao automatica).

## Format Validation

- Todas as tarefas seguem o formato: `- [ ] T### [P]? [US#]? Descricao com arquivo(s)`.
- Fases Setup/Foundational/Polish nao usam label de historia.
- Fases por historia incluem `[US#]` conforme spec.md.
