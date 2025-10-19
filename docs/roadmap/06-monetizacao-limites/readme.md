# Fase 06 — Monetização e Limites

Objetivo: implementar planos de assinatura (Stripe), limites por plano e UX de upgrade.

Metas SMART:
- Específica: planos Free/Pro, limite de processos por usuário/conta, modal de upgrade quando atingir limite.
- Mensurável: 100% validação de limites na criação de processo; taxa de conversão de upgrade mensurada.
- Alcançável: concluir em 2 semanas com backend Stripe e checks de limite.
- Relevante: sustentabilidade do negócio e controle de capacidade.
- Temporal: 2 semanas com fluxo completo de assinatura.

Entregáveis:
- Integração Stripe (checkout, webhooks, status da assinatura).
- Middleware de verificação de limites e atualização de tier/status.
- Modal de upgrade (UX) com comunicação clara.

Critérios de aceite:
- Usuário não consegue exceder o limite; modal de upgrade é exibido com opção de contratação.

Dependências:
- Conta Stripe e configuração de produtos/preços.

Riscos e mitigação:
- Falhas de webhook → retries e logs; estados consistentes.

Timeline:
- Semana 1: integração Stripe + modelos
- Semana 2: limites, UI e QA