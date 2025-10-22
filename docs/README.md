# Legal Mind Documentation (Centralized)

This repository consolidates project knowledge into a single, organized location. All documentation is written in English and aligned with the current technology stack: Next.js + Supabase + Drizzle ORM + shadcn/ui.

Key features:
- Terminology standard: "client" (not "customer") across all code and documentation
- Database documentation: Drizzle + Supabase, focusing on Clients, Processes, Deadlines, and Notifications
- Migration history: Complete changelog of database migrations and architectural decisions
- RBAC/Multi-tenancy: Role-based access control with account and space models

Index:
- Migration Documentation: `docs/migration/` - Database setup, migration history, and changelog
- Glossary & Naming Conventions: `docs/GLOSSARY.md`
- Commit Conventions: `docs/COMMIT_CONVENTIONS.md`
- RBAC Architecture: `docs/RBAC_ARCHITECTURE.md`
- Roadmap: see `docs/roadmap/` for product roadmap and planning

Notes:
- Legacy documents have been backed up under `/backups/<date>/...`. Deprecated or misaligned docs will be listed in `docs/deprecations.md`.
- If you prefer the roadmap to live inside `/docs`, we can move the `/plans` content to `docs/roadmap/` after confirmation.
