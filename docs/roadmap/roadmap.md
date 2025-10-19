# Roadmap Visual — MVP LegalTrack

Stack alinhada: Supabase + Next.js + shadcn/ui + Drizzle (modelagem de banco e migrations).

## Visão Geral
- Foco inicial: prazos e datas fatais, vinculados a processos e clientes.
- Entregas sequenciais com marcos e dependências claras.
- Migrations com Drizzle conduzindo evolução de schema (deadlines → clients/processes → índices/RBAC → limites).

## Linha do Tempo (18 semanas)
```
Semanas:  W01 W02 W03 W04 W05 W06 W07 W08 W09 W10 W11 W12 W13 W14 W15 W16 W17 W18
F00 Estr.: █
F01 Praz.:    ████
F02 Cli/Pro.:          ███
F03 Cal/Notif:                 ██
F04 DataJud:                          ██
F05 RBAC/MT:                                ██
F06 Monetiz.:                                      ██
F07 QA/Release:                                           ██
```
- F00 Estratégia (W01)
- F01 MVP Prazos (W02–W05)
- F02 Clientes & Processos (W06–W08)
- F03 Calendar & Notificações (W09–W10)
- F04 DataJud Base (W11–W12)
- F05 RBAC & Multi-tenancy (W13–W14)
- F06 Monetização & Limites (W15–W16)
- F07 Qualidade & Release (W17–W18)

## Dependências entre Fases
- F01 depende de F00 (visão, KPIs, backlog priorizado)
- F02 depende de F01 (prazos core; vínculo com processos/clientes)
- F03 depende de F01 e F02 (eventos de calendário e conteúdo de descrição)
- F04 depende de F02 (estrutura de processos para consultas)
- F05 depende de F01–F04 (aplicar isolamento e papéis em flows principais)
- F06 depende de F01–F05 (limites e upgrade sobre uso do core)
- F07 depende de F01–F06 (testes, observabilidade e release)

## Marcos (Milestones)
- M1: MVP de Prazos funcional (fim F01) — CRUD de prazos + data fatal + evento no Google Calendar
- M2: Clientes & Processos estáveis (fim F02) — CNJ validado + associação completa aos prazos
- M3: Notificações implantadas (fim F03) — lembretes 7/3/1/0 dias e preferências por usuário
- M4: DataJud base (fim F04) — consultas por CNJ e andamentos com parsing seguro
- M5: RBAC & Multi-tenancy (fim F05) — isolamento por accountId e guards por papel
- M6: Monetização & Limites (fim F06) — Stripe + verificação de limites + modal de upgrade
- M7: Release MVP (fim F07) — testes, observabilidade e deploy estável

## KPIs por Marco
- M1: taxa de sucesso CRUD (>95%), criação de evento no Calendar (≥90%)
- M2: 100% processos com CNJ válido, associação de prazos a processos (100%)
- M3: entregas de notificações programadas (≥95%), adoção de preferências
- M4: sucesso de consultas DataJud (≥95%), latência média < 2s em dev
- M5: cobertura de RBAC em flows críticos (≥90%), nenhum acesso cross-account
- M6: verificação de limites (100%), taxa de conversão para PRO (medida)
- M7: cobertura de testes (≥70% em serviços críticos), 0 blockers pós-release

## Plano de Migrations (Drizzle)
- MIG-001: deadlines core — campos e índices base
- MIG-002: clients — documentos (CPF/CNPJ), tipo_pessoa, endereços
- MIG-003: processes — número CNJ (único), status, relações
- MIG-004: índices — by_document, by_type, by_case_number, by_status
- MIG-005: RBAC/MT — accountId em tabelas e relações necessárias
- MIG-006: limites/assinatura — campos de tier e status (se aplicável ao modelo)

## Riscos & Mitigação
- APIs externas (Google/DataJud/Stripe): implementar retries, timeouts e logs
- Complexidade de RBAC: começar simples e evoluir conforme feedback
- Escopo de processos: manter foco em campos essenciais no MVP

## Checkpoints de Decisão
- End F01: validar proposta de valor e priorizar backlog de F02/F03
- End F03: avaliar necessidade de antecipar DataJud ou reforçar notificações
- End F05: confirmar políticas de acesso e limites antes de monetização

## Observações
- Drizzle será o responsável por modelagem de banco e migrations em todas as fases.
- Roadmap pode sofrer ajustes conforme feedback de usuários e métricas de uso.