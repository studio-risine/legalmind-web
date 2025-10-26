import { relations } from 'drizzle-orm'
import { accounts } from './accounts'
import { clients } from './clients'
import { notes } from './notes'

export const clientsRelations = relations(clients, ({ one, many }) => ({
	// Many-to-one: client to a account
	account: one(accounts, {
		fields: [clients.accountId],
		references: [accounts.id],
	}),
	// One-to-many: client to many notes
	notes: many(notes),
}))
