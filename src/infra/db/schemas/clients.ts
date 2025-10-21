import { pgTable, text, varchar } from 'drizzle-orm/pg-core'
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import { uuidv7 } from 'uuidv7'
import type { z } from 'zod'
import { timestamps } from '../helpers'
import { accounts } from './accounts'
import { clientStatusEnum, clientTypeEnum } from './enums'

export const clients = pgTable('clients', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	account_id: text('account_id')
		.notNull()
		.references(() => accounts.id),
	type: clientTypeEnum('type').notNull().default('INDIVIDUAL'),
	status: clientStatusEnum('status').notNull().default('ACTIVE'),
	name: text('name').notNull(),
	email: varchar('email', { length: 256 }),
	phone: varchar('phone', { length: 256 }),
	tax_id: varchar('tax_id', { length: 32 }),
	notes: text('notes'),
	...timestamps,
})

const clientSelectSchema = createSelectSchema(clients)
export type Client = z.output<typeof clientSelectSchema>

export const clientInsertSchema = createInsertSchema(clients)
export type ClientInsert = z.input<typeof clientInsertSchema>

export const clientOutputSchema = createUpdateSchema(clients)
export type ClientOutput = z.output<typeof clientSelectSchema>
