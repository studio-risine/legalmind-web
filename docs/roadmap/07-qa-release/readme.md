# Fase 07 — Qualidade, Observabilidade e Release

Objetivo: fortalecer qualidade (testes, cobertura), observabilidade (logs, métricas) e realizar release inicial.

Metas SMART:
- Específica: estabelecer suíte mínima de testes, logging central e checklist de release.
- Mensurável: >= 70% cobertura em serviços críticos; 0 blockers nos principais fluxos.
- Alcançável: concluir em 2 semanas com práticas básicas de QA e DevOps.
- Relevante: garantir confiabilidade no MVP.
- Temporal: 2 semanas com deploy e monitoramento.

Entregáveis:
- Testes unitários/integrados das principais features (prazos, calendar, clientes, processos).
- Logs e métricas básicas (erro, latência, taxa de sucesso de notificações).
- Pipeline de deploy e checklist de release.

Critérios de aceite:
- Build estável, testes passando, monitoramento ativo.

Dependências:
- Ambiente de produção e variáveis secure.

Riscos e mitigação:
- Flutuação de latência externa (Google/DataJud) → timeouts e retries configurados.

Timeline:
- Semana 1: testes e observabilidade
- Semana 2: hardening e release