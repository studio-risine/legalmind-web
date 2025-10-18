import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { uuidv7 } from 'uuidv7'
import type { z } from 'zod'

export const clients = pgTable('clients', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	name: text('name').notNull(),
	email: varchar('email', { length: 256 }),
	phone: varchar('phone', { length: 256 }),
	document: varchar('document', { length: 18 }),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
})

const clientSelectSchema = createSelectSchema(clients)
export type Client = z.output<typeof clientSelectSchema>

export const clientInsertSchema = createInsertSchema(clients)
export type ClientInsert = z.input<typeof clientInsertSchema>
