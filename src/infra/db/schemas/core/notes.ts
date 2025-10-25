import { text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { auditFields, uuidPrimaryKey } from '../helpers'
import { clients } from './clients'
import { core } from './schema'

export const notes = core.table('notes', {
	id: uuidPrimaryKey,
	clientId: uuid('client_id')
		.notNull()
		.references(() => clients.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	...auditFields,
})

export const insertNoteSchema = createInsertSchema(notes)
