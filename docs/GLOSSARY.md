# Glossary & Naming Conventions

Canonical terms and conventions to prevent confusion across documentation and code.

## Terms
- Client: the person or organization served by a law firm. Replaces the term "customer" entirely.
- Process (Judicial Case): a legal case tracked by the system; may have CNJ number and court.
- Deadline: a task or key date related to a process (e.g., hearing, filing, internal task).
- Notification: system/email/push messages scheduled around deadlines.
- Account: tenant container for multi-tenancy isolation.
- Role: user permission profile (SUPER_ADMIN, ADMIN, LAWYER).
- CNJ: Brazilian Judicial Process Number (string stored in `processes.cnj`).

## Naming Conventions
- Tables: plural snake_case (e.g., `clients`, `processes`, `deadlines`).
- Columns: snake_case (e.g., `created_at`, `account_id`).
- Enums: UPPER_SNAKE_CASE values (e.g., `PENDING`, `DONE`).
- Foreign Keys: `<referenced_table>_id` (e.g., `client_id`).
- Timestamps: `TIMESTAMP WITH TIME ZONE` with `*_at` suffix.
- Multi-tenancy: every domain table includes `account_id`.

## File & Module Naming
- Modules: `modules/<domain>` (e.g., `modules/client`, `modules/process`, `modules/deadline`).
- Actions: `modules/<domain>/actions` (e.g., `modules/client/actions`).
- Hooks: `modules/<domain>/hooks` (e.g., `modules/client/hooks`).
- Avoid any usage of the term `customer`; use `client` in code, docs, and UI.

## Deprecated Terms
- Customer → Client

## Validation
- Add CI checks to prevent committing references to `customer`.
- Update legacy docs and code progressively; archive or delete misaligned materials after backup.