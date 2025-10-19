# Fase 05 — RBAC e Multi-tenancy

Objetivo: garantir isolamento por conta/organização e permissões por papéis (SUPER_ADMIN, ADMIN, LAWYER), alinhado ao modelo de accounts/spaces já presente.

Metas SMART:
- Específica: implementar middleware/guards de acesso por accountId e roles; ajustar consultas e serviços para isolamento.
- Mensurável: 100% das operações respeitam accountId; testes cobrindo RBAC em operações críticas.
- Alcançável: concluir em 2 semanas com ajustes nas camadas de dados e UI.
- Relevante: requisito essencial para SaaS multi-tenant seguro.
- Temporal: 2 semanas com cobertura mínima de testes.

Entregáveis:
- Ampliação do modelo `accounts`/`spaces` e relações necessárias.
- Middlewares de autenticação e autorização (Supabase Auth + guards).
- Filtros por accountId em services/listagens.

Critérios de aceite:
- Usuário só acessa dados da sua conta; papéis controlam operações (ex.: ADMIN cria, LAWYER edita prazos próprios).

Dependências:
- Supabase Auth funcional e modelo de contas.

Riscos e mitigação:
- Complexidade de regras → começar com RBAC simples e evoluir conforme feedback.

Timeline:
- Semana 1: modelo e middlewares
- Semana 2: ajustes em serviços e testes