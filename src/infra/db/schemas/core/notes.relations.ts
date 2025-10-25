import { relations } from 'drizzle-orm'
import { users } from '../auth/users'
import { clients } from './clients'
import { notes } from './notes'

export const notesRelations = relations(notes, ({ one }) => ({
	// Many-to-one: note to a client
	client: one(clients, {
		fields: [notes.clientId],
		references: [clients.id],
	}),
	// Many-to-one: note created by a user
	creator: one(users, {
		fields: [notes.createdBy],
		references: [users.id],
	}),
}))
