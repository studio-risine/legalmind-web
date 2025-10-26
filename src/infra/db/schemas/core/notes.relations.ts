import { relations } from 'drizzle-orm'
import { accounts } from './accounts'
import { clients } from './clients'
import { notes } from './notes'

export const notesRelations = relations(notes, ({ one }) => ({
	// Many-to-one: note to a client
	client: one(clients, {
		fields: [notes.clientId],
		references: [clients.id],
	}),
	// Many-to-one: note created by a user
	creator: one(accounts, {
		fields: [notes.createdBy],
		references: [accounts.id],
	}),
}))
