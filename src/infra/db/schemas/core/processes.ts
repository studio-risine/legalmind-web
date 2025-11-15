import { text, timestamp, uuid } from 'drizzle-orm/pg-core'
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import type z from 'zod'
import { auditFields, uuidPrimaryKey } from '../helpers'
import { accounts } from './accounts'
import { clients } from './clients'
import { processStatusEnum } from './enums'
import { core } from './schema'
import { spaces } from './spaces'

export const processes = core.table('processes', {
	assignedId: uuid('assigned_id')
		.notNull()
		.references(() => accounts.id, {
			onDelete: 'set default',
		}),
	clientId: uuid('client_id')
		.notNull()
		.references(() => clients.id, { onDelete: 'cascade' }),
	deletedAt: timestamp('deleted_at', {
		withTimezone: true,
	}),
	description: text('description'),
	id: uuidPrimaryKey,
	processNumber: text('process_number').notNull(),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces.id, { onDelete: 'cascade' }),
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
