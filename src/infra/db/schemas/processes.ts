import { jsonb, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import type { z } from 'zod'
import { timestamps } from '../helpers'
import { accounts } from './accounts'
import { clients } from './clients'
import { processStatusEnum } from './enums'
import { spaces } from './spaces'

export const processes = pgTable('processes', {
	id: uuid('id').primaryKey(),

	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),

	processNumber: varchar('process_number', { length: 50 }),

	space_id: uuid('space_id')
		.notNull()
		.references(() => spaces.id),

	status: processStatusEnum('status').notNull().default('ACTIVE'),
	clientId: uuid('client_id').references(() => clients.id),

	assignedId: uuid('assigned_id')
		.notNull()
		.references(() => accounts.id),

	tags: jsonb('tags'),
	...timestamps,
})

const processSelectSchema = createSelectSchema(processes)
export type Process = z.output<typeof processSelectSchema>

export const processInsertSchema = createInsertSchema(processes)
export const processUpdateSchema = createUpdateSchema(processes)
