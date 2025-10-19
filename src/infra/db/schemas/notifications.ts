import {
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'
import { accounts } from './accounts'
import { deadlines } from './deadlines'

export const notifications = pgTable('notifications', {
	id: uuid('id').primaryKey(),
	account_id: integer('account_id')
		.notNull()
		.references(() => accounts.id),
	user_id: text('user_id'), // optional until users table is defined
	deadline_id: uuid('deadline_id').references(() => deadlines.id),
	channel: varchar('channel', { length: 16 }).notNull(), // EMAIL | SYSTEM | PUSH
	payload: jsonb('payload'),
	scheduled_at: timestamp('scheduled_at'),
	sent_at: timestamp('sent_at'),
	status: varchar('status', { length: 16 }).notNull().default('PENDING'),
	error_message: text('error_message'),
	created_at: timestamp('created_at').defaultNow().notNull(),
})
