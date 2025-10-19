# Fase 03 — Google Calendar e Notificações

Objetivo: integrar prazos ao Google Calendar e disponibilizar notificações básicas (sistema/email/push) com preferências do usuário.

Metas SMART:
- Específica: criar evento no Google Calendar ao criar prazo; configurar lembretes padrão; oferecer notificações por sistema e e-mail.
- Mensurável: 90% dos prazos geram eventos de calendário com sucesso; 95% das notificações programadas são disparadas nas janelas definidas.
- Alcançável: concluir em 2 semanas com integração básica e serviços de notificação.
- Relevante: aumenta a aderência à proposta de valor (lembrar o usuário antes da data fatal).
- Temporal: 2 semanas com entrega funcional.

Entregáveis:
- Serviço Google Calendar (criar/atualizar/cancelar eventos) com armazenamento de `google_event_id`.
- Serviço de notificações com agendamento de lembretes (7, 3, 1 dias e no dia).
- Preferências de notificação por usuário (canais e janelas).

Critérios de aceite:
- Criação de prazo dispara criação de evento e agendamentos de notificações.
- Preferências do usuário são persistidas e respeitadas.

Dependências:
- Credenciais Google e mecanismo de agendamento (cron/queue ou eventos programados).

Riscos e mitigação:
- Limitações da API Google → usar retries e logs; fallback para lembretes internos.
- Entrega de e-mail/push → começar com sistema/e-mail e expandir push depois.

Timeline:
- Semana 1: Calendar service + eventos
- Semana 2: notificações + preferências + QA