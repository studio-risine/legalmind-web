# LegalTrack Documentation (Centralized)

This repository consolidates project knowledge from the previous `/docs` and `/plan` directories into a single, organized location. All documentation is now written in English and aligned with the current technology stack: Next.js + Supabase + Drizzle ORM + shadcn/ui.

Key changes:
- Terminology update: we no longer use "customer"; the canonical term is "client".
- Database documentation is centralized around Drizzle + Supabase, focusing on Clients, Processes, Deadlines, Notifications, and RBAC/Multi-tenancy.
- A migration guide is provided for moving from Convex to Supabase + Drizzle, including renaming policy and data mapping.

Index:
- Database Schema (Drizzle + Supabase): `docs/database/schema.md`
- Migration Guide (Convex → Supabase + Drizzle): `docs/migration/convex-to-supabase-drizzle.md`
- Glossary & Naming Conventions: `docs/GLOSSARY.md`
- Clients module usage and patterns: `docs/clients/README.md`
- Roadmap: see `plans/roadmap.md` (will be relocated under docs/roadmap if desired)
- Commit conventions: `docs/COMMIT_CONVENTIONS.md`
- RBAC Architecture: `docs/RBAC_ARCHITECTURE.md`

Notes:
- Legacy documents have been backed up under `/backups/<date>/...`. Deprecated or misaligned docs will be listed in `docs/deprecations.md`.
- If you prefer the roadmap to live inside `/docs`, we can move the `/plans` content to `docs/roadmap/` after confirmation.