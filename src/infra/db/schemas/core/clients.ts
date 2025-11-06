import { text, timestamp } from 'drizzle-orm/pg-core'
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import type z from 'zod'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { clientStatusEnum, clientTypeEnum } from './enums'
import { core } from './schema'
import { spaces } from './spaces'

export const clients = core.table('clients', {
	id: uuidPrimaryKey,
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	email: text('email'),
	phoneNumber: text('phone_number'),
	type: clientTypeEnum('type').notNull(),
	documentNumber: text('document_number').notNull(),
	status: clientStatusEnum('status').notNull(),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	...timestamps,
})

const clientSelectSchema = createSelectSchema(clients)
export type Client = z.output<typeof clientSelectSchema>

export const insertClientSchema = createInsertSchema(clients)
export type InsertClient = z.input<typeof insertClientSchema>

export const updateClientSchema = createUpdateSchema(clients)
export type UpdateClient = z.output<typeof updateClientSchema>

export const clientTypesSchema = createSelectSchema(clientTypeEnum)
export type ClientTypes = z.output<typeof clientTypesSchema>

export const clientStatusSchema = createSelectSchema(clientStatusEnum)
export type ClientStatus = z.output<typeof clientStatusSchema>
