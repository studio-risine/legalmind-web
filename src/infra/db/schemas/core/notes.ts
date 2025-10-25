import { text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { users } from '../auth'
import { clients } from './clients'
import { core } from './schema'

export const notes = core.table('notes', {
	id: uuid('id').primaryKey().defaultRandom(),
	clientId: uuid('client_id')
		.notNull()
		.references(() => clients.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	content: text('content').notNull(),
})

export const insertNoteSchema = createInsertSchema(notes)
