# Fase 01 — MVP de Prazos (Core)

Objetivo: entregar o núcleo do produto com criação, edição, listagem e acompanhamento de prazos, incluindo marcação de data fatal, vinculação a processos/clientes e integração básica com Google Calendar.

Metas SMART:
- Específica: implementar CRUD de prazos com campos essenciais (descrição, data inicial, data de vencimento, dias de prazo, prazo fatal, status, notas) e vínculo a processo/cliente.
- Mensurável: 100% dos prazos criados devem possuir data de vencimento e indicador de prazo fatal; 90% dos prazos com evento criado no Google Calendar; 95% sucesso em criação/edição/listagem em ambiente dev.
- Alcançável: concluir com uma equipe pequena em 4 semanas com testes básicos (unitários e integração).
- Relevante: atende à proposta de valor central (acompanhamento de prazos e data fatal).
- Temporal: 4 semanas com entregas incrementais semanais.

Entregáveis:
- Ampliação do schema `deadlines` no Drizzle (campos essenciais) e relações com `processes` e `clients`.
- Páginas Next.js: Prazos (lista, criar/editar), Processos, Clientes.
- Server Actions/Services: criação, atualização, listagem e status de prazos.
- Integração básica Google Calendar (criar evento na criação do prazo).
- Validações e form helpers (zod) + máscaras de documento e CNJ onde aplicável.

Critérios de aceite:
- É possível criar prazos com data fatal, vincular a processo e cliente e visualizar em uma lista com filtros por status e data.
- Ao criar prazo, um evento é criado no Google Calendar (com título, descrição e lembretes padrão).
- Atualizações de prazos refletem no front e na camada de dados sem erros.
- Testes mínimos (>= 15 unitários/integrados) cobrindo fluxo principal.

Dependências:
- Supabase + Drizzle configurados e tabelas mínimas operacionais.
- Credenciais Google Calendar (dev) e configuração inicial de OAuth/Service Account.

Riscos e mitigação:
- Falhas na criação de eventos → retries e logs; permitir fallback sem calendário.
- Schema inicial simplificado → documentar campos futuros e migrações incrementais.

Timeline:
- Semana 1: schema + services + páginas base
- Semana 2: formulários e validações + fluxo CRUD
- Semana 3: integração Google Calendar (criar evento) + ajustes UX
- Semana 4: testes, refinamentos e hardening