import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'
import { deadlines } from './deadlines'
import { notificationChannelEnum, notificationStatusEnum } from './enums'

export const notifications = pgTable('notifications', {
	id: uuid('id').primaryKey(),
	account_id: text('account_id')
		.notNull()
		.references(() => accounts.id),
	user_id: text('user_id'),
	deadline_id: text('deadline_id').references(() => deadlines.id),
	channel: notificationChannelEnum('channel').notNull(),
	payload: jsonb('payload'),
	scheduled_at: timestamp('scheduled_at'),
	sent_at: timestamp('sent_at'),
	status: notificationStatusEnum('status').notNull().default('PENDING'),
	error_message: text('error_message'),
	created_at: timestamp('created_at').defaultNow().notNull(),
})
