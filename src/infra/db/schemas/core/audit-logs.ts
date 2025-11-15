import { text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { accounts } from './accounts'
import { auditActionEnum, auditEntityEnum } from './enums'
import { core } from './schema'
import { spaces } from './spaces'

export const auditLogs = core.table('audit_logs', {
	_id: uuidPrimaryKey,
	action: auditActionEnum('action').notNull(), // action type
	actorId: uuid('actor_id')
		.notNull()
		.references(() => accounts._id, { onDelete: 'set null' }),
	entity: auditEntityEnum('entity').notNull(),
	entityId: uuid('entity_id').notNull(),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces._id, { onDelete: 'cascade' }),
	summary: text('summary').notNull(),
	...timestamps,
})

export const insertAuditLogSchema = createInsertSchema(auditLogs)
export type InsertAuditLog = z.input<typeof insertAuditLogSchema>

const auditLogSelectSchema = createSelectSchema(auditLogs)
export type AuditLog = z.output<typeof auditLogSelectSchema>

export type AuditAction = (typeof auditLogs.action.enumValues)[number]
export type AuditEntity = (typeof auditLogs.entity.enumValues)[number]
