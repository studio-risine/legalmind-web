import { text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { accounts } from './accounts'
import { clientStatusEnum, clientTypeEnum } from './enums'
import { core } from './schema'

export const clients = core.table('clients', {
	id: uuidPrimaryKey,
	accountId: uuid('account_id')
		.notNull()
		.references(() => accounts.userId, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	email: text('email'),
	phoneNumber: text('phone_number'),
	type: clientTypeEnum('type').notNull(),
	documentNumber: text('document_number').notNull(),
	status: clientStatusEnum('status').notNull(),
	...timestamps,
})

export const insertClientSchema = createInsertSchema(clients)
