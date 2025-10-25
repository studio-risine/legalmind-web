import { text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { users } from '../auth'
import { accounts } from './accounts'
import { processStatusEnum } from './enums'
import { core } from './schema'
import { spaces } from './spaces'

export const processes = core.table('processes', {
	id: uuid('id').primaryKey().defaultRandom(),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	processNumber: text('process_number').notNull(),
	status: processStatusEnum('status').notNull().default('ACTIVE'),
	assignedId: uuid('assigned_id')
		.notNull()
		.references(() => accounts.userId, { onDelete: 'set default' }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
})

export const insertProcessSchema = createInsertSchema(processes)
