import { date, integer, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { accounts } from './accounts'
import { deadlinePriorityEnum, deadlineStatusEnum } from './enums'
import { processes } from './processes'
import { core } from './schema'
import { spaces } from './spaces'

export const deadlines = core.table('deadlines', {
	_id: uuidPrimaryKey,
	anticipationDays: integer('anticipation_days').notNull().default(5),
	assignedId: uuid('assigned_id').references(() => accounts._id, { onDelete: 'set null' }),
	completedAt: timestamp('completed_at', { withTimezone: true }),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	description: text('description').notNull(),
	dueDate: date('due_date', { mode: 'date' }).notNull(),
	notes: text('notes'),
	priority: deadlinePriorityEnum('priority'),
	processId: uuid('process_id')
		.notNull()
		.references(() => processes._id, { onDelete: 'cascade' }),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces._id, { onDelete: 'cascade' }),
	status: deadlineStatusEnum('status').notNull().default('OPEN'),
	...timestamps,
})

export const insertDeadlineSchema = createInsertSchema(deadlines)
export type InsertDeadline = z.input<typeof insertDeadlineSchema>

const deadlineSelectSchema = createSelectSchema(deadlines)
export type Deadline = z.output<typeof deadlineSelectSchema>
