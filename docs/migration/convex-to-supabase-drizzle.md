# Migration Guide: Convex → Supabase + Drizzle ORM

This guide describes how to migrate data and application code from Convex to Supabase (Postgres) with Drizzle ORM, while enforcing the terminology change from "customer" to "client".

## Scope
- Data migration: export from Convex, transform, import to Supabase
- Schema alignment: Drizzle schema for `clients`, `processes`, `deadlines`, etc.
- Code migration: services, hooks, actions, and UI components
- Naming policy: `customer` → `client` (all code and docs)

## Pre-migration Checklist
- Freeze writes on Convex (maintenance mode) during migration window
- Tag the last Convex commit for rollback
- Ensure Supabase project is provisioned and accessible
- Generate Drizzle migrations for canonical schema (`docs/database/schema.md`)
- Create backups for `/docs`, `/plan`, and `/plans` (already done under `/backups/<date>/...`)

## Data Model Mapping

| Convex Entity | New Postgres Table | Notes |
| --- | --- | --- |
| `customers` | `clients` | rename; consolidate fields (email/phone/tax_id) |
| `cases` or `processes` | `processes` | keep `cnj`, `court`, `status` |
| `tasks` / `deadlines` | `deadlines` | due date, type, status, priority; link to process/client |
| `notifications` | `notifications` | channel, scheduled/sent times, status |
| `users` | `users` | account-based RBAC |
| `activity` | `activity_logs` | immutable audit trail |

## Export from Convex
- Preferred: export JSON via dedicated functions or backup tooling
- Example approach:
  - Implement Convex queries to dump collections into JSON files (chunked)
  - Structure per entity: `convex_export/clients.json`, `processes.json`, `deadlines.json`, etc.

## Transform & Import

1) Write a Node.js script to read Convex JSON and insert into Supabase using Drizzle:

```ts
// scripts/import-from-convex.ts
import fs from 'node:fs/promises'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import { accounts, users, clients, processes, deadlines } from '../src/db/schema'

const client = new Client({ connectionString: process.env.DATABASE_URL })
const db = drizzle(client)

async function run() {
  await client.connect()

  const clientsData = JSON.parse(await fs.readFile('convex_export/clients.json', 'utf8'))
  for (const c of clientsData) {
    await db.insert(clients).values({
      id: c.id,
      account_id: c.accountId,
      type: c.type === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL',
      name: c.name,
      email: c.email,
      phone: c.phone,
      tax_id: c.taxId,
      notes: c.notes,
    })
  }

  // Repeat for processes, deadlines, notifications...

  await client.end()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

2) Alternatively, use Supabase `COPY` from CSV for large datasets, then reconcile with Drizzle scripts.

## Indexes & Constraints
- After import, create necessary indexes as recommended in `docs/database/schema.md`
- Validate referential integrity (e.g., all `processes.client_id` exist or are set NULL)

## Code Migration

- Rename and reorganize modules:
  - `modules/customer` → `modules/client`
  - Remove `services/customer`/`services/clients` → use `modules/client/actions`
  - `hooks/customer` → `modules/client/hooks` (consolidated into `use-client-queries` and `use-client-mutations`)
- Update internal names/types/status enums:
  - Replace any `Customer*` types with `Client*`
  - Update component and file names
- Replace Convex calls with Drizzle/Supabase calls:
  - Replace Convex actions with Next.js server actions hitting Drizzle services
  - Use Supabase auth and row-level security as appropriate (or application-level checks)

## Validation & Rollout
- Data checks: counts per entity before/after, spot-check records
- Functional checks: CRUD for clients/processes/deadlines
- Notifications: verify scheduling and sending paths
- Observability: log migration anomalies to `activity_logs`
- Rollout plan: enable writes on Supabase, disable Convex endpoints; monitor for 48 hours

## Naming Policy Enforcement
- Lint for forbidden terms: add a CI check disallowing `customer` in code and docs
- Update README, docs, and code comments to use `client`

## Troubleshooting
- Orphaned references: set `client_id`/`process_id` to NULL when source records are missing
- Timezone consistency: ensure all timestamps use `TIMESTAMP WITH TIME ZONE`
- Index performance: create partial indexes or tune as needed for heavy filters

## Backout Strategy
- If critical errors occur, revert traffic to Convex (tagged release)
- Keep import scripts idempotent and rerunnable
- Maintain full backups of exported JSON and Supabase database snapshots