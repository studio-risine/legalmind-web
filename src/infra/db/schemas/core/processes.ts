import { text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type z from 'zod'
import { auditFields, uuidPrimaryKey } from '../helpers'
import { accounts } from './accounts'
import { clients } from './clients'
import { processStatusEnum } from './enums'
import { core } from './schema'
import { spaces } from './spaces'

export const processes = core.table('processes', {
	_id: uuidPrimaryKey,
	assignedId: uuid('assigned_id')
		.notNull()
		.references(() => accounts._id, { onDelete: 'set default' }),
	clientId: uuid('client_id').references(() => clients._id, { onDelete: 'set default' }),
	court: text('court'),
	courtClass: text('court_class'),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	description: text('description'),
	partiesSummary: text('parties_summary'),
	phase: text('phase'),
	processNumber: text('process_number').notNull().unique(),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces._id, { onDelete: 'cascade' }),
	status: processStatusEnum('status').notNull().default('ACTIVE'),
	title: text('title').notNull(),
	...auditFields,
})

export const processSchema = createSelectSchema(processes)
export type Process = z.output<typeof processSchema>

export const insertProcessSchema = createInsertSchema(processes)
export type InsertProcess = z.input<typeof insertProcessSchema>

export const updateProcessSchema = createUpdateSchema(processes)
export type UpdateProcess = z.output<typeof updateProcessSchema>

export const processStatusSchema = createSelectSchema(processStatusEnum)
export type ProcessStatus = z.output<typeof processStatusSchema>
