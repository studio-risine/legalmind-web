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
	deletedAt: timestamp('deleted_at', {
		withTimezone: true,
	}),
	documentNumber: text('document_number').notNull(),
	email: text('email'),
	id: uuidPrimaryKey,
	name: text('name').notNull(),
	phoneNumber: text('phone_number'),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces.id, { onDelete: 'cascade' }),
	status: clientStatusEnum('status').notNull(),
	type: clientTypeEnum('type').notNull(),
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
