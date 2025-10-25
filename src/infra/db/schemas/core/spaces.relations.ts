import { relations } from 'drizzle-orm'
import { users } from '../auth/users'
import { processes } from './processes'
import { spaces } from './spaces'
import { spacesToAccounts } from './spaces-to-accounts'

export const spacesRelations = relations(spaces, ({ one, many }) => ({
	// One-to-one: space created by user
	creator: one(users, {
		fields: [spaces.createdBy],
		references: [users.id],
	}),
	// Many-to-many: space to many accounts
	spacesToAccounts: many(spacesToAccounts),
	// One-to-many: space to many processes
	processes: many(processes),
}))
