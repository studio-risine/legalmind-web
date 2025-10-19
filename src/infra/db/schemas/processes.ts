import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers'
import { accounts } from './accounts'
import { clients } from './clients'

export const processes = pgTable('processes', {
	id: uuid('id').primaryKey(),
	account_id: integer('account_id')
		.notNull()
		.references(() => accounts.id),
	client_id: text('client_id').references(() => clients.id),
	cnj: varchar('cnj', { length: 32 }),
	court: varchar('court', { length: 120 }),
	title: varchar('title', { length: 160 }),
	status: varchar('status', { length: 32 }).notNull().default('ACTIVE'),
	tags: jsonb('tags'),
	archived_at: timestamp('archived_at'),
	...timestamps,
})
