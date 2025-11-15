# Phase 0: Research & Decisions — Centralização de Processos

Date: 2025-11-08
Branch: 001-centralize-legal-processes
Spec: ./spec.md

## Unknowns Extracted from Technical Context

1) CNJ API (endpoints/credenciais/limites por tribunal)
2) Esquema de CSV para importação
3) Tipos e limites de arquivo (Storage)
4) Política de “alerta reduzido” para processos arquivados (frequência/destino)

## Research Tasks and Consolidated Findings

### 1) CNJ API — Integração e Fallback
- Decision: Inicialmente integrar com fonte pública por tribunal quando disponível (ex.: consulta processual) e consolidar normalização para o número CNJ; fallback para não-disponibilidade com re-tentativas e log.
- Rationale: Disponibilidade varia entre tribunais; padronizar por número CNJ reduz acoplamento. Fallback mantém resiliência e atende SC-005 (24h).
- Alternatives considered:
  - Agregador terceirizado (custo/contratos) — adiado para fase futura.
  - Captura via scraping — riscos de estabilidade e conformidade.

### 2) CSV de Importação — Esquema
- Decision: Colunas mínimas: numero_processo_cnj (string CNJ), parte_principal (string), classe (string opcional), vara (string opcional), data_distribuicao (ISO opcional). Demais colunas ignoradas com aviso.
- Rationale: Foco no onboarding rápido; CNJ é chave de unificação. Campos opcionais enriquecem quando disponíveis.
- Alternatives considered:
  - Esquema extenso (todas as partes/advogados) — aumenta atrito;
  - CSV multi-aba — complexidade maior sem ganho inicial.

### 3) Storage — Tipos e Limites
- Decision: Tipos suportados: pdf, docx, png, jpg; tamanho máximo 25MB por arquivo; retenção indefinida; versão por sobrescrita desativada na 1ª entrega.
- Rationale: Cobre maioria de documentos jurídicos com custo controlado. Pode ser revisado após uso real.
- Alternatives considered:
  - Suporte a vídeos/zips — custo e riscos de segurança;
  - Versionamento nativo — adiar para reduzir complexidade inicial.

### 4) Alerta Reduzido — Política
- Decision: Em processos arquivados, manter prazos ativos porém com “alerta reduzido” = apenas notificação in-app (sem e-mail/push) e digest diário em vez de imediato.
- Rationale: Reduz ruído mantendo visibilidade de obrigações remanescentes; compatível com FR-015.
- Alternatives considered:
  - Suspender totalmente — risco de perder obrigação residual;
  - Manter 100% dos alertas — excesso de ruído em casos arquivados.

## Updates to Technical Context

Todos os itens marcados como NEEDS CLARIFICATION foram resolvidos com as decisões acima. Planejar configuração administrável para: limite de upload, tipos de arquivo, e janela do digest diário (padrão 18:00 local).

## Impact on Specification

- FR-004/017/021: Confirmado padrão 5 dias e configurável.
- FR-015: Detalhe de “alerta reduzido” definido (in-app + digest diário, sem push/email).
- Edge cases: adicionar regra de import duplicada no CSV (detectar pelo CNJ).

## Open Risks

- Variação de disponibilidade por tribunal pode impactar SC-005; mitigação: backoff exponencial + monitoramento.
- CSV grande (>5k) pode exigir chunking; validar em POC.

