import { relations } from 'drizzle-orm'
import { jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { uuidv7 } from 'uuidv7'
import type { z } from 'zod'
import { timestamps } from '../helpers'
import { clients } from './clients'
import { processStatusEnum } from './enums'
import { spaces } from './spaces'

/**
 * The 'id' column uses 'text' type instead of native UUID type to support UUIDv7 generation.
 * This is a significant schema change from 'uuid' to 'text'.
 * Rationale: Some databases and ORMs may not natively support UUIDv7 or may have limitations with the UUID type.
 * Using 'text' ensures compatibility and future-proofs the schema for UUIDv7.
 * Migration: Existing UUIDs should be migrated as strings; ensure all existing UUIDs are valid string representations.
 * Breaking change: This may require a data migration if the previous type was 'uuid'.
 */
export const processes = pgTable('processes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	space_id: text('space_id')
		.notNull()
		.references(() => spaces.id),
	client_id: text('client_id').references(() => clients.id),
	cnj: varchar('cnj', { length: 32 }),
	court: varchar('court', { length: 120 }),
	title: varchar('title', { length: 160 }),
	status: processStatusEnum('status').notNull().default('ACTIVE'),
	tags: jsonb('tags'),
	archived_at: timestamp('archived_at'),
	...timestamps,
})

export const processesRelations = relations(processes, ({ one }) => ({
	space: one(spaces, {
		fields: [processes.space_id],
		references: [spaces.id],
	}),
	client: one(clients, {
		fields: [processes.client_id],
		references: [clients.id],
	}),
}))

const processSelectSchema = createSelectSchema(processes)
export type Process = z.output<typeof processSelectSchema>

export const processInsertSchema = createInsertSchema(processes)
export type ProcessInsert = z.input<typeof processInsertSchema>
