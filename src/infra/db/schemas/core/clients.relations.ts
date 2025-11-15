import { relations } from 'drizzle-orm'
import { clients } from './clients'
import { notes } from './notes'
import { processes } from './processes'
import { spaces } from './spaces'

export const clientsRelations = relations(clients, ({ one, many }) => ({
	// One-to-many: client has many notes
	notes: many(notes),
	// One-to-many: client has many processes
	processes: many(processes),
	// Many-to-one: client belongs to a space
	space: one(spaces, {
		fields: [clients.spaceId],
		references: [spaces._id],
	}),
}))
