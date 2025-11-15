import { integer, text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'
import { nanoPrimaryKey, timestamps } from '../helpers'
import { deadlines } from './deadlines'
import { alertModeEnum, alertStatusEnum } from './enums'
import { core } from './schema'
import { spaces } from './spaces'

export const alerts = core.table('alerts', {
	_id: nanoPrimaryKey,
	anticipationDays: integer('anticipation_days').notNull(),
	deadlineId: uuid('deadline_id')
		.notNull()
		.references(() => deadlines._id, { onDelete: 'cascade' }),
	mode: alertModeEnum('mode').notNull().default('NORMAL'),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces._id, { onDelete: 'cascade' }),
	status: alertStatusEnum('status').notNull().default('ACTIVE'),
	...timestamps,
})

export const insertAlertSchema = createInsertSchema(alerts)
export type InsertAlert = z.input<typeof insertAlertSchema>

const alertSelectSchema = createSelectSchema(alerts)
export type Alert = z.output<typeof alertSelectSchema>
