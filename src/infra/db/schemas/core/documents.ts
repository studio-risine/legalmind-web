import { integer, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { accounts } from './accounts'
import { documentCategoryEnum } from './enums'
import { processes } from './processes'
import { core } from './schema'
import { spaces } from './spaces'

export const documents = core.table('documents', {
	_id: uuidPrimaryKey,
	category: documentCategoryEnum('category').notNull(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => accounts._id, { onDelete: 'set null' }),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	mimeType: text('mime_type').notNull(),
	phaseRef: text('phase_ref'),
	processId: uuid('process_id')
		.notNull()
		.references(() => processes._id, { onDelete: 'cascade' }),
	sizeBytes: integer('size_bytes').notNull(),
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces._id, { onDelete: 'cascade' }),
	storagePath: text('storage_path').notNull(),
	title: text('title').notNull(),
	...timestamps,
})

export const insertDocumentSchema = createInsertSchema(documents)
export type InsertDocument = z.input<typeof insertDocumentSchema>

const documentSelectSchema = createSelectSchema(documents)
export type Document = z.output<typeof documentSelectSchema>
