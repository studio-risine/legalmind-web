# Migration Documentation

This folder contains database migration documentation for the Legal Mind project.

---

## 📚 Documentation Index

### 📜 [CHANGELOG.md](./CHANGELOG.md)
**Complete migration history and architectural decisions**

Contains chronological record of all database migrations, including:
- Platform migration from Convex to Supabase + Drizzle ORM
- Entity model changes and terminology updates (`customer` → `client`)
- Detailed documentation for each applied migration (0000, 0001, 0002)
- Rollback strategies and references

**Use this when:**
- Understanding the evolution of the database schema
- Investigating historical decisions
- Troubleshooting migration-related issues
- Onboarding new team members

---

### 🔧 [DATABASE-SETUP.md](./DATABASE-SETUP.md)
**Operational guide for daily database management**

Practical guide for working with Drizzle ORM, including:
- Quick start commands for migrations and seeding
- Step-by-step workflow for creating new migrations
- Database reset and troubleshooting procedures
- Complete command reference

**Use this when:**
- Setting up the database locally
- Creating a new migration after schema changes
- Seeding test data for development
- Debugging database connection or migration issues

---

## 🚀 Quick Reference

### First Time Setup

```bash
# 1. Start database
supabase start
# or
docker compose up -d pg

# 2. Apply migrations
pnpm db:migrate

# 3. Seed test data
pnpm db:seed
```

### Creating a Migration

```bash
# 1. Modify schema in src/infra/db/schemas/
# 2. Generate migration
pnpm db:generate

# 3. Review generated SQL
cat src/infra/db/migrations/0003_*.sql

# 4. Apply migration
pnpm db:migrate
```

### Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Populate with test data |
| `pnpm db:studio` | Visual database browser |
| `pnpm db:generate` | Create new migration |
| `supabase db reset` | Reset local database |

---

## 📂 Related Files

### Migration Files
- **Location:** `/src/infra/db/migrations/`
- **Applied migrations:** 0000 (initial), 0001 (last_name), 0002 (user sync)
- **Meta tracking:** `/src/infra/db/migrations/meta/`

### Schema Definitions
- **Location:** `/src/infra/db/schemas/`
- **Key schemas:** accounts, clients, processes, deadlines, spaces, notifications
- **Enums:** client_status, process_status, deadline_type, etc.

### Seed Scripts
- **Location:** `/src/infra/db/seeds/`
- **Modules:** users, spaces, clients, processes
- **Orchestrator:** `index.ts`

---

## 🔗 External Links

- [Project README](../../README.md) - Main project documentation
- [RBAC Architecture](../RBAC_ARCHITECTURE.md) - Role-based access control design
- [Glossary](../GLOSSARY.md) - Project terminology and conventions
- [Drizzle ORM Docs](https://orm.drizzle.team) - Official Drizzle documentation
- [Supabase Docs](https://supabase.com/docs) - Official Supabase documentation

---

## 🆘 Need Help?

### Database Issues
1. Check [DATABASE-SETUP.md → Troubleshooting](./DATABASE-SETUP.md#troubleshooting)
2. Verify environment variables in `.env.local`
3. Check database connection: `psql $DATABASE_URL`

### Migration Issues
1. Review [CHANGELOG.md](./CHANGELOG.md) for historical context
2. Check applied migrations: `pnpm db:studio` → `__drizzle_migrations` table
3. Detect schema drift: `pnpm db:drift`

### Questions About Schema Changes
1. Check [CHANGELOG.md](./CHANGELOG.md) for reasoning behind past changes
2. Review related schemas in `/src/infra/db/schemas/`
3. Consult the team before major structural changes

---

## 📋 Migration Checklist

When creating a new migration:

- [ ] Schema changes made in `src/infra/db/schemas/`
- [ ] Migration generated: `pnpm db:generate`
- [ ] Generated SQL reviewed and validated
- [ ] Migration applied locally: `pnpm db:migrate`
- [ ] Types updated (if needed): `pnpm supabase:types`
- [ ] Test data seeded: `pnpm db:seed`
- [ ] Migration tested in clean database
- [ ] CHANGELOG.md updated (for significant changes)
- [ ] Migration file committed with schema changes

---

## 🗂️ Archive

Historical migration documentation before reorganization is available in:
- `/backups/2025-10-19/docs/migration/`

These files contain the original Convex → Supabase migration planning and implementation notes.
