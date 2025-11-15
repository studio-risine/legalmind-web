# Implementation Plan: Centralização Integrada de Processos Jurídicos

**Branch**: `001-centralize-legal-processes` | **Date**: 2025-11-08 | **Spec**: specs/001-centralize-legal-processes/spec.md
**Input**: Feature specification from `specs/001-centralize-legal-processes/spec.md`

## Summary

Entregar o módulo "Processo" com ciclo de vida completo: cadastro/importação (CNJ API e CSV), operação diária (prazos com alertas, documentos, andamentos), e visibilidade (painel, auditoria), com atualização automática de andamentos. Implementação em Next.js (App Router) com Supabase (Auth, Postgres, Storage) e rotinas de atualização via Cron serverless. Abas alvo em process/page: Resumo, Atividades, Histórico.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 15 (App Router)
**Primary Dependencies**: Drizzle ORM (typed SQL), Supabase (Auth, Postgres, Storage), Zod (validação), shadcn/ui, TanStack Table, React Hook Form
**Storage**: PostgreSQL (Supabase) com schemas tipados via Drizzle
**Testing**: Vitest + Testing Library (conforme vitest.config.ts); lint com Biome
**Target Platform**: Web SaaS (Next.js), com jobs agendados serverless (Cron)
**Project Type**: Single web app (monorepo único)
**Performance Goals**: UX responsiva; 95% dos alertas disparados dentro da janela configurada; importação de CSV de até 5k linhas < 2 min
**Constraints**: Multi-tenancy e RBAC (via Supabase Auth e papéis internos); auditoria de ações; privacidade de dados; limites de taxa de integrações externas
**Scale/Scope**: Por organização; centenas a milhares de processos; anexos documentais por caso; consultas diárias a fontes externas

NEEDS CLARIFICATION (mapeado para Phase 0 research):
- CNJ API: especificação de endpoints/credenciais/limites por tribunal e fallback quando indisponível.
- Esquema do CSV de importação (colunas obrigatórias, formatos CNJ, normalização).
- Tipos e limites de arquivo no Storage (extensões, tamanho máximo, retenção/versão).
- Política de "alerta reduzido" (frequência/destino); opções: menor frequência vs. desativar push e manter in-app.

## Constitution Check

Gates (derivados da Constituição Legal Mind):
- Deadline Management: prazos auditáveis, alertas configuráveis, priorização — ALINHADO (FR-003, FR-004, FR-017, SC-002, auditoria).
- Process/Client/Financial Organization: entidades Processo/Clientes/Partes/Honorários básicos — ALINHADO (escopo incluso; financeiro avançado excluído).
- Multi-Tenancy & RBAC: isolamento por organização e papéis — ALINHADO (planejar colunas space_id e políticas de acesso; middleware existente).
- Notification & Auditability: notificações internas e trilha de auditoria — ALINHADO (FR-017, FR-020, SC-006).
- Modern UX & Retention: App Router + UI consistente; acessibilidade — ALINHADO.
- Technical/Security: Postgres tipado, Zod/TS — ALINHADO.

Resultado: PASS pré-Pesquisa. Revalidar após desenho de dados/contratos.

Constitution Check (pós-Design): PASS — Data model inclui multi-tenant + auditoria; contratos cobrem prazos/alertas/notificações; pesquisa define política de alerta reduzido e CSV mínimo; integrações externas com fallback e re-tentativas (ver research.md).

## Project Structure

### Documentation (this feature)

```text
specs/001-centralize-legal-processes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md   # (criado por /speckit.tasks, fora deste comando)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (private)/process/            # vistas do processo (Resumo, Atividades, Histórico)
│   └── api/                          # handlers para contratos (REST) quando aplicável
├── modules/
│   ├── process/                      # lógica de domínio do processo (server actions, queries)
│   ├── client/                       # vínculos (clientes/partes)
│   └── notification/                 # alertas/cronos
├── infra/
│   └── db/                           # Drizzle schemas/migrations
├── libs/                             # utilidades (zod, queries, id)
└── components/                       # UI (shadcn/ui, tabelas)

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Single web app com App Router e módulos por domínio (process, client, notification). Contratos mapeiam para rotas em `src/app/api` e server actions nos módulos.

## Complexity Tracking

N/A (sem violações de constituição neste plano).
