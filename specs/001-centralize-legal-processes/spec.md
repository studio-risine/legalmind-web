# Feature Specification: Centralização Integrada de Processos Jurídicos

**Feature Branch**: `001-centralize-legal-processes`
**Created**: 2025-11-08
**Status**: Draft
**Input**: User description: "Escritórios jurídicos lidam diariamente com centenas de processos que exigem controle rigoroso de prazos, atualização de andamentos, organização documental e visibilidade operacional. Os fluxos atuais são fragmentados: informações ficam em diferentes fontes (tribunais, planilhas, e-mails), há risco de perda de prazos, retrabalho no registro manual de atividades e dificuldade de auditoria. É necessário centralizar todas as informações do processo jurídico em um módulo único, integrado e automatizado."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Capturar e Centralizar Processos Existentes (Priority: P1)

Um analista jurídico importa ou cadastra processos ativos (número único de identificação) e o sistema consolida automaticamente dados básicos (partes, classe, vara) e agenda prazos existentes em uma visão única.

**Why this priority**: Sem a centralização inicial não há base única; é a porta de entrada que gera valor imediato reduzindo dispersão em planilhas e risco de esquecimento de prazos.

**Independent Test**: Testável isoladamente verificando se um processo cadastrado aparece com metadados consolidados e prazos iniciais na visão central sem necessidade de outras histórias.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado com perfil de analista, **When** informa o número de processo válido e confirma, **Then** o sistema registra o processo e exibe metadados básicos consolidados.
2. **Given** um processo recém cadastrado, **When** a importação automática encontra prazos futuros, **Then** eles são listados associados ao processo com datas e responsáveis padrão.

---

### User Story 2 - Gerir Prazos com Alertas Preventivos (Priority: P2)

Um coordenador visualiza a lista de prazos consolidados por processo, aplica filtros (status, proximidade) e configura alertas para prazos críticos garantindo acompanhamento preventivo.

**Why this priority**: A gestão efetiva de prazos reduz risco operacional e perda de prazo judicial, impactando diretamente resultados e compliance.

**Independent Test**: Pode ser validada isoladamente ao cadastrar prazos existentes (mock) e verificar geração de alertas e mudança de estado sem depender de captura automática.

**Acceptance Scenarios**:

1. **Given** prazos cadastrados com datas futuras, **When** o usuário define alerta para "7 dias antes", **Then** o sistema agenda notificação interna marcada para execução no tempo definido.
2. **Given** um prazo marcado como concluído, **When** a lista é filtrada por "pendentes", **Then** o prazo concluído não aparece.

---

### User Story 3 - Organização Documental por Processo (Priority: P3)

Um usuário anexa documentos (petições, despachos, decisões) a um processo, os classifica (tipo, fase) e pesquisa rapidamente para reutilização e auditoria.

**Why this priority**: Organização documental diminui retrabalho e tempo de busca, aumentando eficiência da equipe.

**Independent Test**: Validável isoladamente com upload e classificação local de documentos sem depender de prazos ou captura externa.

**Acceptance Scenarios**:

1. **Given** um processo existente, **When** o usuário envia um documento PDF e escolhe categoria "Petição Inicial", **Then** o documento aparece listado com categoria e data de inclusão.
2. **Given** múltiplos documentos anexados, **When** o usuário pesquisa por termo presente no título, **Then** retorna somente documentos correspondentes.

---

### User Story 4 - Visibilidade Operacional e Auditoria (Priority: P4)

Um gestor visualiza painel de status (quantidade de processos por fase, prazos próximos, documentos recentes) e acessa trilha de auditoria (quem incluiu/alterou prazos e documentos) para garantir governança.

**Why this priority**: Aumenta transparência operacional e permite detectar riscos e gargalos.

**Independent Test**: Testável isoladamente com dados simulados gerando métricas agregadas e registro de ações.

**Acceptance Scenarios**:

1. **Given** atividades registradas (cadastro de processo, upload de documento), **When** o gestor abre auditoria, **Then** a lista mostra ação, ator, horário e entidade impactada.
2. **Given** diferentes processos em fases distintas, **When** o painel é carregado, **Then** exibe contadores agregados por fase e prazos críticos destacados.

### User Story 5 - Atualização Automatizada de Andamentos (Priority: P5)

O sistema consulta fontes externas configuradas e atualiza andamento (movimentações processuais) incorporando novos eventos na linha do tempo do processo.

**Why this priority**: Reduz trabalho manual de monitorar portais e aumenta velocidade de reação.

**Independent Test**: Validável isoladamente simulando retorno externo e verificando inclusão de andamento.

**Acceptance Scenarios**:

1. **Given** um processo com último andamento conhecido, **When** chega novo evento externo, **Then** o andamento é registrado e marcado como "novo" até visualização.
2. **Given** múltiplos eventos recebidos com timestamps, **When** linha do tempo é exibida, **Then** eventos aparecem ordenados cronologicamente.

### Edge Cases

- Cadastro de processo com número inválido ou formato incorreto (deve rejeitar e orientar correção).
- Importação duplicada do mesmo processo (deve evitar registros duplicados e indicar já existente).
- Prazos simultâneos no mesmo dia para um processo (ordenar e não confundir alertas).
- Upload de documento com tipo não suportado (mensagem clara e rejeição).
- Andamento externo recebido com data retroativa anterior já registrada (marcar como histórico sem duplicar).
- Perda temporária de fonte externa (registrar tentativa e reprogramar consulta).
- Processo arquivado: prazos futuros permanecem ativos com modo de alerta reduzido; retorno ao alerta normal apenas se o processo for reaberto ou por decisão explícita do gestor.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Sistema DEVE permitir cadastro/importação de processo via número único validando formato e unicidade.
- **FR-002**: Sistema DEVE consolidar metadados básicos do processo (partes, classe, vara) após cadastro.
- **FR-003**: Usuário DEVE conseguir visualizar lista de prazos associados ao processo com status (pendente, concluído, crítico).
- **FR-004**: Usuário DEVE poder configurar alerta antecedente (em dias) para cada prazo; o padrão é 5 dias (configurável pelo usuário).
- **FR-005**: Sistema DEVE registrar ações relevantes em trilha de auditoria (quem, quando, qual entidade, tipo de ação).
- **FR-006**: Usuário DEVE anexar documentos por processo informando categoria e título pesquisável.
- **FR-007**: Sistema DEVE oferecer busca textual por título e categoria dentro dos documentos de um processo.
- **FR-008**: Sistema DEVE apresentar painel com métricas agregadas (contagem por fase, prazos críticos, documentos recentes).
- **FR-009**: Sistema DEVE atualizar automaticamente linha do tempo de andamentos a partir de fontes externas configuradas.
- **FR-010**: Sistema DEVE marcar andamentos novos até visualização pelo usuário.
- **FR-011**: Sistema DEVE prevenir duplicidade de processos já cadastrados.
- **FR-012**: Sistema DEVE permitir mudança de status de prazo (pendente -> concluído) com registro na auditoria.
- **FR-013**: Sistema DEVE lidar com falhas transitórias em fontes externas reprogramando tentativa.
- **FR-014**: Sistema DEVE suportar múltiplos prazos no mesmo dia sem confundir ordenação.
- **FR-015**: Sistema DEVE manter prazos ativos em processos arquivados com modo de alerta reduzido (menor frequência/urgência); retorno ao modo normal ocorre na reabertura do processo ou por decisão expressa do gestor.
- **FR-016**: Sistema DEVE permitir classificação de documentos (fase, tipo) para filtragem posterior.
- **FR-017**: Sistema DEVE gerar notificações internas para alertas configurados quando a janela de antecedência for atingida; prazos são considerados “críticos” quando dentro do limite padrão de 5 dias (configurável).
- **FR-018**: Sistema DEVE garantir ordenação cronológica da linha do tempo de andamentos.
- **FR-019**: Sistema DEVE disponibilizar exportação resumida de dados do processo (metadados, prazos, documentos indexados) em formato CSV por padrão e oferecer também PDF consolidado como formato adicional.
- **FR-020**: Sistema DEVE assegurar que cada ação auditável contenha ator, timestamp e referência do objeto.
 - **FR-021**: Sistema DEVE permitir configurar o limite que define “prazo crítico”, com padrão inicial de 5 dias.

### Key Entities *(include if feature involves data)*

- **Processo**: Representa caso jurídico; atributos: número, partes resumidas, classe, vara, fase, status (ativo, arquivado), datas relevantes.
- **Prazo**: Compromisso associado ao processo; atributos: data limite, descrição, status (pendente, concluído, crítico), alerta antecedência, responsável.
- **Documento**: Arquivo anexado; atributos: título, categoria, fase relacionada, data inclusão, referência processo.
- **Andamento**: Evento na linha temporal; atributos: data do evento, descrição, origem (externa/interna), status de leitura (novo, visto).
- **Alerta**: Configuração de notificação ligada a um prazo; atributos: prazo alvo, antecedência (dias), status (ativo, disparado).
- **Auditoria**: Registro de ação; atributos: ator, timestamp, tipo ação (criação, alteração, conclusão), entidade referenciada, resumo.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Usuários conseguem cadastrar e consolidar um processo em menos de 90 segundos em 90% das tentativas.
- **SC-002**: 95% dos prazos críticos recebem alerta com antecedência mínima configurada sem falhas de entrega.
- **SC-003**: Redução de 40% no tempo médio de busca por documento relacionado a um processo (baseline pré-modulo vs pós-modulo em 30 dias).
- **SC-004**: Redução de 30% em incidentes de perda de prazo reportados após 60 dias de uso.
- **SC-005**: 90% dos novos andamentos externos são incorporados na linha do tempo em até 24h desde a disponibilidade pública.
- **SC-006**: 100% das ações críticas (criação de processo, conclusão de prazo, upload de documento) têm registro de auditoria completo.

### Definitions

- Prazo crítico: prazo cuja data limite está a 5 dias ou menos (padrão), podendo o usuário ajustar esse limite.

### Assumptions

- Fontes externas disponibilizam dados de andamento em intervalos regulares (mínimo diário).
- Usuários já autenticados via mecanismo padrão da plataforma (não redefinido aqui).
- Política de arquivamento: prazos permanecem ativos com alerta reduzido enquanto arquivado.
- Exportação resumida deve priorizar portabilidade simples (CSV), com PDF consolidado adicional para compartilhamento/auditoria.
- Janela de antecedência padrão para prazos críticos é 5 dias, ajustável por usuário.

<!-- Clarifications resolved by stakeholder responses on 2025-11-08: Q1=B (alerta reduzido em arquivados), Q2=default 5 dias configurável, Q3=A (PDF adicional). -->

### Risks

- Falhas de integração externa podem atrasar atualização de andamentos.
- Excessiva complexidade inicial do painel pode atrasar adoção se não priorizado corretamente.
- Armazenamento de grande volume documental impacta custos operacionais se não houver política de retenção.

### Out of Scope

- Gestão financeira ou faturamento de honorários.
- Automatização de elaboração de peças processuais.
- Inteligência preditiva de resultados judiciais.
