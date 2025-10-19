# Tarefas — Fase 05 (RBAC e Multi-tenancy)

## Modelo e Relações
- [ ] Revisar `accounts` e `spaces` e criar relações com usuários e dados
- [ ] Adicionar `accountId` onde necessário (clients, processes, deadlines)

## Autorização
- [ ] Middleware de autenticação (Supabase Auth)
- [ ] Guards por papel (SUPER_ADMIN, ADMIN, LAWYER)
- [ ] Regras de edição e leitura por accountId

## Services e Listagens
- [ ] Aplicar filtros por accountId em todas as consultas
- [ ] Expor erros claros de autorização
- [ ] Garantir que todas as operações de criação/edição definam `account_id` corretamente
- [ ] Propagar `account_id` dos services para hooks e componentes

## UI
- [ ] Adicionar seletor de conta/empresa onde aplicável
- [ ] Exibir somente dados da conta atual em tabelas e cards
- [ ] Incluir `account_id` no estado de filtros/paginação e nas chamadas aos services

## RLS e Policies (Supabase)
- [ ] Criar policies para `clients`, `processes`, `deadlines`, `notifications` restringindo por `account_id`
- [ ] Validar fluxo de autenticação e sessão para obtenção de `account_id` ativo
- [ ] Implementar papéis de acesso (RBAC) usando claims e `auth.jwt()`
- [ ] Cobrir com testes de RLS (acesso permitido/negado por conta e papel)

## Testes
- [ ] Cenários de acesso permitido/negado
- [ ] Cobrir operações críticas (criar/editar prazos)
- [ ] Testar paginação e busca com `account_id`

## Documentação
- [ ] Modelo de papéis e escopo de permissões
- [ ] Padrões de isolamento por conta
- [ ] Guia de configuração de policies e exemplos de consultas com `account_id`