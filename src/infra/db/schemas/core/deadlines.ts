import { date, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { deadlinePriorityEnum, deadlineStatusEnum } from './enums'
import { processes } from './processes'
import { core } from './schema'
import { spaces } from './spaces'

export const deadlines = core.table('deadlines', {
	deletedAt: timestamp('deleted_at', {
		withTimezone: true,
	}),
	dueDate: date('due_date', { mode: 'date' }).notNull(),
	id: uuidPrimaryKey,
	notes: text('notes'),
	priority: deadlinePriorityEnum('priority').notNull().default('MEDIUM'),
	processId: uuid('process_id')
		.notNull()
		.references(() => processes.id, {
			onDelete: 'cascade',
		}),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces.id, { onDelete: 'cascade' }),
	status: deadlineStatusEnum('status').notNull().default('OPEN'),
	...timestamps,
})

export const insertDeadlineSchema = createInsertSchema(deadlines)
export type InsertDeadline = z.input<typeof insertDeadlineSchema>

const deadlineSelectSchema = createSelectSchema(deadlines)
export type Deadline = z.output<typeof deadlineSelectSchema>
