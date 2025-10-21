import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { timestamps } from '../helpers'
import { accounts } from './accounts'
import { clients } from './clients'
import {
	deadlinePriorityEnum,
	deadlineStatusEnum,
	deadlineTypeEnum,
} from './enums'
import { processes } from './processes'

export const deadlines = pgTable('deadlines', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	account_id: text('account_id')
		.notNull()
		.references(() => accounts.id),
	process_id: text('process_id').references(() => processes.id),
	client_id: text('client_id').references(() => clients.id),
	title: varchar('title', { length: 160 }).notNull(),
	description: text('description'),
	due_at: timestamp('due_at').notNull(),
	type: deadlineTypeEnum('type').notNull().default('OTHER'),
	status: deadlineStatusEnum('status').notNull().default('PENDING'),
	priority: deadlinePriorityEnum('priority').notNull().default('MEDIUM'),
	google_event_id: varchar('google_event_id', { length: 128 }),
	completed_at: timestamp('completed_at'),
	...timestamps,
})
