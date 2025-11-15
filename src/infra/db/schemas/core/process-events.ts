import { boolean, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { eventOriginEnum } from './enums'
import { processes } from './processes'
import { core } from './schema'
import { spaces } from './spaces'

export const processEvents = core.table('process_events', {
	description: text('description').notNull(),
	eventAt: timestamp('event_at', { withTimezone: true }).notNull(),
	externalRef: text('external_ref'),
	id: uuidPrimaryKey,
	origin: eventOriginEnum('origin').notNull(),
	processId: uuid('process_id')
		.notNull()
		.references(() => processes._id, { onDelete: 'cascade' }),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces._id, { onDelete: 'cascade' }),
	viewed: boolean('viewed').notNull().default(false),
	...timestamps,
})

export const insertProcessEventSchema = createInsertSchema(processEvents)
export type InsertProcessEvent = z.input<typeof insertProcessEventSchema>

const processEventSelectSchema = createSelectSchema(processEvents)
export type ProcessEvent = z.output<typeof processEventSelectSchema>
