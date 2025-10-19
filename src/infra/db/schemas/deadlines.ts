import {
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

import { timestamps } from '../helpers'
import { accounts } from './accounts'
import { clients } from './clients'
import { processes } from './processes'

export const deadlines = pgTable('deadlines', {
	id: uuid('id').primaryKey(),
	account_id: integer('account_id')
		.notNull()
		.references(() => accounts.id),
	process_id: uuid('process_id').references(() => processes.id),
	client_id: text('client_id').references(() => clients.id),
	title: varchar('title', { length: 160 }).notNull(),
	description: text('description'),
	due_at: timestamp('due_at').notNull(),
	type: varchar('type', { length: 24 }).notNull().default('OTHER'),
	status: varchar('status', { length: 24 }).notNull().default('PENDING'),
	priority: varchar('priority', { length: 16 }).notNull().default('MEDIUM'),
	google_event_id: varchar('google_event_id', { length: 128 }),
	completed_at: timestamp('completed_at'),
	...timestamps,
})
