# Tarefas — Fase 01 (MVP de Prazos)

## Banco de Dados (Drizzle/Supabase)
- [ ] Expandir `deadlines` com campos:
  - id (uuid), processo_id (uuid), cliente_id (uuid), descricao (text), data_inicial (date), data_vencimento (date), dias_prazo (int), prazo_fatal (boolean), status (enum: pendente, cumprido, perdido), notas (text), google_event_id (varchar), notificacoes_enviadas (jsonb), created_at/updated_at
- [ ] Criar/ajustar relações: `deadlines` → `processes` (N:1), `deadlines` → `clients` (N:1)
- [ ] Migração inicial e seed mínimo

## Backend (Actions/Services)
- [ ] Implementar services para prazos: create, update, list, getByProcess, changeStatus
- [ ] Regras: validar data fatal (flag), impedir data_vencimento < data_inicial, calcular dias_prazo quando aplicável
- [ ] Logs mínimos (auditoria básica) e retorno consistente com zod schemas

## Frontend (Next.js + shadcn)
- [ ] Página Lista de Prazos com filtros: por status, data, prazo fatal, processo, cliente
- [ ] Formulário Criar/Editar Prazo com validações (zod) e máscaras
- [ ] UI de status (badges) e destaque para prazo fatal
- [ ] Navegação entre Clientes → Processos → Prazos

## Integração Google Calendar
- [ ] Service para criar evento ao criar prazo (summary, description, date, reminders)
- [ ] Armazenar `google_event_id` e prever atualizações/cancelamento básico

## Testes e Qualidade
- [ ] Unitários dos services (validações, regras de negócio)
- [ ] Integração (server actions + DB)
- [ ] Testes de UI básicos (playwright/cypress opcional)

## Documentação
- [ ] README de prazos: campos, fluxos, integrações
- [ ] Checklist de lançamento interno da fase