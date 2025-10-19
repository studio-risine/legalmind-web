# Tarefas — Fase 03 (Calendar e Notificações)

## Google Calendar
- [ ] Implementar `GoogleCalendarService` (criar/atualizar/remover eventos)
- [ ] Mapear campos: summary, description (processo/cliente), start/end (date), reminders (email/popup)
- [ ] Persistir `google_event_id` em `deadlines`

## Notificações
- [ ] `NotificationService` com agendamentos (7, 3, 1, 0 dias)
- [ ] Canais iniciais: sistema e e-mail; push em backlog
- [ ] Persistir logs de envio e status (JSONB)

## Preferências
- [ ] Tabela/config de preferências por usuário (canais, janelas)
- [ ] UI simples para toggles e horários

## Testes
- [ ] Testes de integração Calendar (mock)
- [ ] Testes de agendamentos e execução de notificações

## Documentação
- [ ] Guia de integração Calendar e limites da API
- [ ] Fluxo de notificações e fallback