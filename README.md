<div align="center">

# Legal Mind

Modern legal process and deadline management for law firms and solo practitioners.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-0A0A0A)](https://orm.drizzle.team)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?logo=vitest)](https://vitest.dev)
[![Biome](https://img.shields.io/badge/Biome-2.2-60A5FA)](https://biomejs.dev)

</div>

## Overview

Legal Mind helps you organize clients, processes, and deadlines with multi-tenant RBAC, calendar-friendly metadata, and a clean UX built on shadcn/ui. The core MVP centers on deadline tracking (prazos), with notifications and process linking.

Key domain entities: Clients, Processes, Deadlines, Notifications, Users/Accounts.

## Features

- Deadline management with priority, status, and due dates
- Link deadlines to processes and clients
- Multi-tenancy via accounts with RBAC (SUPER_ADMIN, ADMIN, LAWYER)
- Supabase Postgres with Drizzle migrations and typed queries
- Notification records (email/system/push) with scheduling metadata
- Modern UI with Tailwind CSS v4 and shadcn/ui
- Tooling: Biome, Husky, Commitlint, Vitest

See documentation at `docs/` for deeper architecture and product notes.

## Tech Stack

- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS v4, shadcn/ui
- Backend: Supabase (Postgres), Drizzle ORM (postgres-js), Next.js server actions
- Auth: Supabase SSR helpers (`@supabase/ssr`) for client/server
- Types & Validation: TypeScript, Zod, drizzle-zod
- State/Data: TanStack Query, TanStack Table
- Testing & DX: Vitest, Testing Library, Biome, Husky, Commitlint

## Monorepo layout (excerpt)

```
src/
├─ app/                # Next.js app router
├─ components/         # UI and data table primitives
├─ infra/              # Env + database (Drizzle + Postgres)
│  ├─ db/
│  │  ├─ schemas/      # Drizzle schema (accounts, clients, processes, deadlines, ...)
│  │  └─ migrations/   # Generated SQL migrations
│  └─ env.ts           # Zod-validated runtime env
├─ libs/supabase/      # Supabase SSR/browser clients and types
├─ modules/            # Domain modules (client, process, deadline, ...)
└─ utils/              # Shared helpers (formatters, masks, etc.)
docs/
└─ ...                 # Centralized documentation (schema, RBAC, roadmap)
```

## Getting Started

Prerequisites:
- Node.js 20+
- pnpm 9+ (recommended) or npm
- Docker (for local PostgreSQL)

### Quick Setup

For detailed setup instructions for different environments (Docker local, Supabase, or tests), see **[Development Setup Guide](docs/DEVELOPMENT_SETUP.md)**.

#### Basic Steps

### 1) Clone and install

```bash
git clone https://github.com/studio-risine/legalmind.git
cd legalmind
pnpm install
```

### 2) Configure environment

Copy the example environment file:

```bash
cp .env.development.example .env.development
```

For Supabase setup, see the [Development Setup Guide](docs/DEVELOPMENT_SETUP.md).

### 3) Start PostgreSQL with Docker

```bash
docker compose up -d
```

This creates both `legalmind` (development) and `legalmind_test` (test) databases.

### 4) Run migrations

```bash
pnpm db:migrate
```

### 5) Start development

```bash
pnpm dev
```

App runs at http://localhost:3000

## Development Environments

The project supports multiple development environments:

- **Local Docker** - PostgreSQL in Docker (recommended for most development)
- **Supabase** - Remote Supabase database (for testing Supabase features)
- **Test** - Isolated test database for automated tests

Each environment has its own configuration file and npm scripts. See the **[Development Setup Guide](docs/DEVELOPMENT_SETUP.md)** for complete details.

## Scripts

### Development
- `pnpm dev` - Start Next.js with Docker PostgreSQL
- `pnpm dev:supabase` - Start Next.js with Supabase
- `pnpm build` - Build for production
- `pnpm start` - Run production server

### Database (Docker)
- `pnpm db:generate` - Generate new Drizzle migrations
- `pnpm db:migrate` - Apply migrations to Docker PostgreSQL
- `pnpm db:studio` - Open Drizzle Studio for Docker database

### Database (Supabase)
- `pnpm db:generate:supabase` - Generate migrations for Supabase
- `pnpm db:migrate:supabase` - Apply migrations to Supabase
- `pnpm db:studio:supabase` - Open Drizzle Studio for Supabase

### Testing
- `pnpm test` - Run tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate coverage report

### Code Quality
- `pnpm check` - Biome check
- `pnpm fix` - Biome check with auto-fix
- `pnpm format` - Format code with Biome
- `pnpm type-check` - TypeScript type checking
- `pnpm ci` - CI check (fails on warnings)

See the **[Development Setup Guide](docs/DEVELOPMENT_SETUP.md)** for environment-specific details.

## Database & Auth

- Postgres via Supabase or Docker (configurable per environment)
- Drizzle ORM with typed schema under `src/infra/db/schemas`
- Supabase SSR helpers for cookie/session handling in `src/libs/supabase`
- Multi-tenancy: every domain table includes `account_id`
- RBAC roles: SUPER_ADMIN, ADMIN, LAWYER

References:
- **[Development Setup Guide](docs/DEVELOPMENT_SETUP.md)** - Environment configuration
- Database schema: `docs/database/schema.md`
- RBAC architecture: `docs/RBAC_ARCHITECTURE.md`
- Migration guide (Convex → Supabase + Drizzle): `docs/migration/convex-to-supabase-drizzle.md`

## Contribution

- Follow Conventional Commits. See `docs/COMMIT_CONVENTIONS.md`.
- Lint/format before commits (Husky + Biome are configured).
- Prefer the domain module structure under `src/modules/*`.

## Roadmap & Docs

- Central docs: `docs/README.md`
- Product/domain: `docs/LEGAL_MANAGEMENT.md`
- Roadmap: `docs/roadmap/roadmap.md`

## License

MIT — see repository license for details.
