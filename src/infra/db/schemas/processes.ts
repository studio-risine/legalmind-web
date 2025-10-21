import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { uuidv7 } from 'uuidv7'
import type { z } from 'zod'
import { timestamps } from '../helpers'
import { accounts } from './accounts'
import { clients } from './clients'

export const processes = pgTable('processes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
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

const processSelectSchema = createSelectSchema(processes)
export type Process = z.output<typeof processSelectSchema>

export const processInsertSchema = createInsertSchema(processes)
export type ProcessInsert = z.input<typeof processInsertSchema>
