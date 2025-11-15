# Quickstart — Módulo Processo

Date: 2025-11-08

## Pré-requisitos
- Node 20+, pnpm
- Variáveis `.env` do Supabase (Auth, Postgres, Storage) configuradas
- Drizzle configurado (drizzle.config.ts)

## Como rodar
1. Instalar deps: `pnpm install`
2. Executar app: `pnpm dev`
3. Acessar página do processo: `/process` (private)

## Fluxos para validação
- Cadastro manual: informar número CNJ válido e salvar; verificar metadados e prazos iniciais.
- Importação CSV: enviar arquivo com `numero_processo_cnj, parte_principal, classe?, vara?, data_distribuicao?`.
- Prazos: criar, ajustar antecedência (default 5), concluir; verificar auditoria.
- Documentos: upload (pdf, docx, png, jpg até 25MB), classificar e pesquisar.
- Histórico: simular andamentos e checar ordenação e marcação “novo”.
- Arquivado: marcar processo como arquivado e confirmar “alerta reduzido” (apenas in-app + digest diário).

## Cron/Integrações
- Definir job diário para consulta de andamentos (retry/backoff). Monitorar taxa e indisponibilidade por tribunal.

## RBAC & Multi-tenancy
- Todas as ações restritas ao tenant do usuário autenticado; papéis controlam edição/visualização.

## Troubleshooting
- Import duplicada: números CNJ repetidos são ignorados e registrados como já existentes.
- CSV inválido: falhas de validação devem indicar linha e coluna.
