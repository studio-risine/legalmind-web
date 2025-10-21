# Centralized Database Schema (Drizzle + Supabase)

This document defines the canonical schema for LegalMind using Drizzle ORM on Supabase (Postgres). It replaces any previous, non-domain-specific diagrams and ensures alignment with our terminology: clients, processes, deadlines, notifications, RBAC, and multi-tenancy.

## Principles
- Multi-tenancy by `account_id` (and optional `space_id` if needed)
- Referential integrity with foreign keys and sensible `ON DELETE` policies
- Explicit indexes for high-query paths (CNJ, due dates, account filters)
- Auditable operations with an immutable activity log
- Consistent naming: table names plural (snake_case); columns snake_case; enums for constrained values

## Entities Overview
- accounts: tenant container
- users: platform users, linked to accounts and roles
- clients: people or organizations served by accounts
- processes: judicial/legal processes linked to clients
- deadlines: key dates/tasks associated to processes/clients
- notifications: scheduled and sent notifications for deadlines/events
- user_preferences: per-user notification and UX preferences
- activity_logs: immutable audit trail
- subscriptions: monetization linkage (Stripe)

## Drizzle Table Definitions (TypeScript)

```ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// accounts
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  plan: varchar('plan', { length: 32 }).notNull().default('free'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
})

// users (RBAC: SUPER_ADMIN, ADMIN, LAWYER)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 160 }).notNull().unique(),
  name: varchar('name', { length: 120 }),
  role: varchar('role', { length: 32 }).notNull().default('LAWYER'),
  account_id: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  is_active: boolean('is_active').notNull().default(true),
  last_login_at: timestamp('last_login_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
})

// clients (canonical term; replaces "customers")
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey(),
  account_id: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 16 }).notNull().default('INDIVIDUAL'), // INDIVIDUAL | COMPANY
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 160 }),
  phone: varchar('phone', { length: 40 }),
  tax_id: varchar('tax_id', { length: 32 }), // CPF/CNPJ or equivalent
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
})

// processes (judicial cases)
export const processes = pgTable('processes', {
  id: uuid('id').primaryKey(),
  account_id: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
  client_id: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  cnj: varchar('cnj', { length: 32 }), // CNJ number
  court: varchar('court', { length: 120 }),
  title: varchar('title', { length: 160 }),
  status: varchar('status', { length: 32 }).notNull().default('ACTIVE'), // ACTIVE | ARCHIVED | ON_HOLD
  tags: jsonb('tags'), // optional categorization
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
  archived_at: timestamp('archived_at', { withTimezone: true }),
})

// deadlines (core MVP)
export const deadlines = pgTable('deadlines', {
  id: uuid('id').primaryKey(),
  account_id: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
  process_id: uuid('process_id').references(() => processes.id, { onDelete: 'set null' }),
  client_id: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 160 }).notNull(),
  description: text('description'),
  due_at: timestamp('due_at', { withTimezone: true }).notNull(),
  type: varchar('type', { length: 24 }).notNull().default('OTHER'), // HEARING | FILING | INTERNAL | OTHER
  status: varchar('status', { length: 24 }).notNull().default('PENDING'), // PENDING | DONE | CANCELED
  priority: varchar('priority', { length: 16 }).notNull().default('MEDIUM'), // LOW | MEDIUM | HIGH
  google_event_id: varchar('google_event_id', { length: 128 }),
  created_by: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
  completed_at: timestamp('completed_at', { withTimezone: true }),
})

// notifications (email/system/push)
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey(),
  account_id: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  deadline_id: uuid('deadline_id').references(() => deadlines.id, { onDelete: 'cascade' }),
  channel: varchar('channel', { length: 16 }).notNull(), // EMAIL | SYSTEM | PUSH
  payload: jsonb('payload'), // message content, templating variables
  scheduled_at: timestamp('scheduled_at', { withTimezone: true }),
  sent_at: timestamp('sent_at', { withTimezone: true }),
  status: varchar('status', { length: 16 }).notNull().default('PENDING'), // PENDING | SENT | FAILED
  error_message: text('error_message'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
})

// user preferences (notification settings)
export const user_preferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  email_notifications: boolean('email_notifications').notNull().default(true),
  push_notifications: boolean('push_notifications').notNull().default(false),
  daily_digest: boolean('daily_digest').notNull().default(false),
  timezone: varchar('timezone', { length: 64 }).notNull().default('America/Sao_Paulo'),
  default_reminders: jsonb('default_reminders'), // e.g. ["48h","24h","1h"]
})

// immutable activity logs
export const activity_logs = pgTable('activity_logs', {
  id: uuid('id').primaryKey(),
  account_id: uuid('account_id').references(() => accounts.id, { onDelete: 'set null' }),
  actor_id: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 64 }).notNull(),
  entity: varchar('entity', { length: 64 }).notNull(), // e.g. "deadline"
  entity_id: uuid('entity_id'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().default(sql`now()`),
})

// subscriptions (Stripe)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey(),
  account_id: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
  stripe_customer_id: varchar('stripe_customer_id', { length: 64 }).notNull(),
  stripe_subscription_id: varchar('stripe_subscription_id', { length: 64 }),
  plan: varchar('plan', { length: 32 }).notNull().default('free'),
  status: varchar('status', { length: 24 }).notNull().default('active'),
  current_period_start: timestamp('current_period_start', { withTimezone: true }),
  current_period_end: timestamp('current_period_end', { withTimezone: true }),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().default(sql`now()`),
})
```

## Indexes (recommended)
- processes(cnj) unique per account: `UNIQUE (account_id, cnj)`
- deadlines(account_id, due_at) for listing and notifications
- deadlines(status), deadlines(type), deadlines(priority) for filtering
- clients(account_id, name) text-pattern ops for search
- notifications(scheduled_at), notifications(status) for execution scheduling

## Foreign Keys & Delete Policies
- accounts → cascade to clients, processes, deadlines, notifications, subscriptions
- processes → set null on client removal (preserve process history)
- deadlines → cascade notifications; set null on client/process deletion
- activity_logs → no cascade; retain audit history
- user_preferences → cascade on user delete

## Multi-tenancy & Authorization
- Every domain table includes `account_id` and queries MUST filter by it
- Add role-based guards in server actions (SUPER_ADMIN, ADMIN, LAWYER)

## Migrations & Seeds
- Place migrations under `drizzle/migrations` and run via `drizzle-kit` against Supabase
- Seed minimal data for local dev: one account, one admin, sample client/process/deadline

## Notes on Terminology
- "customers" are fully replaced by "clients" across code and docs
- Ensure code paths and imports adopt `modules/client`, `modules/client/actions`, `modules/client/hooks`

## Next Steps
- Implement `clients`, `processes`, and `deadlines` tables and generate Drizzle migrations
- Update actions and UI to use `clients` terminology end to end
- Configure indices in Supabase to match recommended set above
