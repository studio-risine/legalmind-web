import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import type { z } from 'zod'
import { timestamps } from '../helpers'
import { accounts } from './accounts'
import { clientStatusEnum, clientTypeEnum } from './enums'

export const clients = pgTable('clients', {
	id: uuid('id').primaryKey(),
	name: text('name').notNull(),
	email: varchar('email', { length: 256 }),
	phone: varchar('phone', { length: 256 }),
	accountId: uuid('account_id')
		.notNull()
		.references(() => accounts.id),

	clientType: clientTypeEnum('type').notNull().default('INDIVIDUAL'),
	documentNumber: varchar('document_number', { length: 32 }),
	status: clientStatusEnum('status').notNull().default('ACTIVE'),

	notes: text('notes'),
	...timestamps,
})

const clientSelectSchema = createSelectSchema(clients)
export type Client = z.output<typeof clientSelectSchema>

export const clientInsertSchema = createInsertSchema(clients)
export type ClientInsert = z.input<typeof clientInsertSchema>

export const clientOutputSchema = createUpdateSchema(clients)
export type ClientOutput = z.output<typeof clientSelectSchema>
