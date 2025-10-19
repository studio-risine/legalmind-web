# Tarefas — Fase 02 (Clientes e Processos)

## Banco de Dados
- [ ] Expandir `clients`: tipo_pessoa (enum fisica/juridica), documento_tipo (CPF/CNPJ), endereco (jsonb), ativo (boolean), notas
- [ ] Expandir `processes`: numero_cnj (varchar, único), classe (text), assunto (text), instancia (enum), tribunal (varchar), vara (text), juiz (text), valor_causa (decimal), situacao (enum), data_distribuicao (date), data_citacao (date), notas
- [ ] Índices: by_document, by_type (cliente), by_case_number, by_status, by_client

## Backend
- [ ] Services: clientes (create, update, list, search), processos (create, update, list, search)
- [ ] Validar número CNJ com regex/validação utilitária
- [ ] Associações: processo → cliente; prazo → processo/cliente

## Frontend
- [ ] Form Cliente com máscara de documento e validação
- [ ] Form Processo com validação CNJ e seleção de cliente
- [ ] Listas com filtros e paginação básica

## Testes
- [ ] Unitários de validação CNJ e documentos
- [ ] Integração dos services com DB

## Documentação
- [ ] Campos e relações de clientes/processos
- [ ] Fluxos de cadastro e associação com prazos