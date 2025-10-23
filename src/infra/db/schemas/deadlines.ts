import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
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
	id: uuid('id').primaryKey(),
	title: varchar('title', { length: 160 }).notNull(),
	description: text('description'),

	accountId: uuid('account_id')
		.notNull()
		.references(() => accounts.id),
	processId: uuid('process_id').references(() => processes.id),
	clientId: uuid('client_id').references(() => clients.id),

	type: deadlineTypeEnum('type').notNull().default('OTHER'),
	status: deadlineStatusEnum('status').notNull().default('PENDING'),
	priority: deadlinePriorityEnum('priority').notNull().default('MEDIUM'),

	...timestamps,
	completedAt: timestamp('completed_at'),
})
