import { text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { accounts } from './accounts'
import { clientStatusEnum, clientTypeEnum } from './enums'
import { core } from './schema'

export const clients = core.table('clients', {
	id: uuid('id').primaryKey().defaultRandom(),
	accountId: uuid('account_id')
		.notNull()
		.references(() => accounts.userId, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	email: text('email'),
	phoneNumber: text('phone_number'),
	type: clientTypeEnum('type').notNull(),
	documentNumber: text('document_number').notNull(),
	status: clientStatusEnum('status').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export const insertClientSchema = createInsertSchema(clients)
