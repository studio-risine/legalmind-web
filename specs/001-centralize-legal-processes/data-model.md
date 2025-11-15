# Data Model — Módulo Processo

Date: 2025-11-08
Branch: 001-centralize-legal-processes

## Entities & Relationships

- Organização (tenant)
  - 1..N Processos
- Processo
  - Fields: id (uuid), space_id, numero_cnj (unique), partes_resumo, classe, vara, fase, status (ativo|arquivado), created_at, updated_at
  - Relationships: 1..N Prazos, 1..N Documentos, 1..N Andamentos, N..N Clientes/Partes
- Prazo
  - Fields: id, process_id, space_id, descricao, due_date, status (pendente|concluido|critico), antecedencia_dias (int, default 5), responsavel_user_id, created_at, updated_at, completed_at
  - Derived: critico = now() >= due_date - antecedencia_dias
- Alerta
  - Fields: id, prazo_id, space_id, antecedencia_dias (int), status (ativo|disparado), modo (normal|reduzido), created_at
  - Relationship: N..1 Prazo
- Documento
  - Fields: id, process_id, space_id, titulo, categoria, fase_ref, storage_path, mime, size_bytes, created_by, created_at
- Andamento
  - Fields: id, process_id, space_id, origem (externa|interna), descricao, event_at, visto (bool), created_at, external_ref
- Auditoria
  - Fields: id, space_id, actor_user_id, action (create|update|complete|upload), entity (process|prazo|documento|andamento), entity_id, summary, created_at
- Cliente/Parte (simplificado no escopo)
  - Fields: id, space_id, nome, tipo (cliente|parte|advogado)space
  - Relations: N..N com Processo (process_clients table)

## Validation Rules (from spec)

- Processo.numero_cnj: formato CNJ válido, único por organização.
- Prazo: due_date no futuro para criação; transição pendente->concluido registra auditoria.
- Documento: tipos permitidos [pdf, docx, png, jpg]; tamanho ≤ 25MB.
- Andamento: ordenação cronológica; novos marcados como "novo" até visto=true.
- Alerta: antecedencia_dias ≥ 0; modo=reduzido quando processo.status=arquivado.

## State Transitions

- Processo.status: ativo -> arquivado (set alertas para modo reduzido); arquivado -> ativo (restaura modo normal)
- Prazo.status: pendente -> concluido (set completed_at e auditoria); pendente -> critico (derivado por data)
- Andamento.visto: false -> true ao abrir timeline

## Notes on Multi-tenancy & RBAC

- Todas as tabelas devem incluir space_id e policies de acesso por usuário autenticado (Supabase Auth) vinculadas ao tenant.
- Papéis (SUPER_ADMIN, ADMIN, LAWYER) controlam criação/edição/visualização; leitura mínima para LAWYER dentro do tenant.
