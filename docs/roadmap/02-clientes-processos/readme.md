# Fase 02 — Clientes e Processos (Base)

Objetivo: estruturar clientes e processos com validações essenciais (CNJ), vinculação aos prazos e UX básica para cadastro e pesquisa.

Metas SMART:
- Específica: implementar CRUD de clientes e processos com validação de número CNJ e vínculo aos prazos.
- Mensurável: 95% sucesso em operações de criação/edição/listagem em dev; 100% processos com número CNJ válido; 100% prazos vinculados a processo.
- Alcançável: concluir em 3 semanas com formulários e listas funcionais.
- Relevante: fundamenta o acompanhamento de prazos, associando-os ao contexto jurídico.
- Temporal: 3 semanas com revisões semanais.

Entregáveis:
- Ampliação de `clients` e `processes` com campos mínimos úteis (nome/documentos, número CNJ, classe/assunto, status, notas).
- Páginas Next.js: Clientes (lista, criar/editar), Processos (lista, criar/editar).
- Validação CNJ e máscaras de documento (CPF/CNPJ) reutilizando utils existentes.
- Associação clara nos forms: seleção de cliente e processo ao criar um prazo.

Critérios de aceite:
- É possível cadastrar clientes e processos com validações e associar prazos ao processo.
- Listas com filtros básicos (por cliente, status de processo, número CNJ).

Dependências:
- Padrões de validação já presentes na base (libs/utils), revisão de modelos Drizzle.

Riscos e mitigação:
- Escopo de processos muito amplo → começar simples (número CNJ, estado/instância, status, notas) e evoluir depois.

Timeline:
- Semana 1: schemas e services
- Semana 2: formulários e listas
- Semana 3: integração com prazos e refinamentos