# Fase 04 — Integração DataJud (Base)

Objetivo: implementar base para consulta de processos via DataJud (CNJ) e preparar hooks para sincronizações futuras.

Metas SMART:
- Específica: fornecer consulta por número CNJ e listar andamentos básicos; sem sincronização completa nesta fase.
- Mensurável: 95% sucesso em consultas válidas; latência média < 2s em ambiente dev.
- Alcançável: concluir em 2 semanas com cliente HTTP robusto e parsing consistente.
- Relevante: agrega valor ao contexto de prazos com dados do processo.
- Temporal: 2 semanas com endpoints e UI simples de consulta.

Entregáveis:
- `DataJudClient` com métodos de consulta (processo e andamentos) e parsing seguro.
- Página/flow de pesquisa por CNJ e exibição de andamentos.
- Estrutura para webhook e sincronização futura (stub).

Critérios de aceite:
- Usuário informa número CNJ, sistema retorna dados básicos do processo.
- Erros manuseados com mensagens claras; logs mínimos.

Dependências:
- Chave de API e políticas de uso do DataJud.

Riscos e mitigação:
- Instabilidade da API → timeouts, retries, circuit breaker simples.

Timeline:
- Semana 1: cliente e parsing
- Semana 2: UI simples e testes