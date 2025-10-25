import { relations } from 'drizzle-orm'
import { users } from '../auth/users'
import { accounts } from './accounts'
import { clients } from './clients'
import { processes } from './processes'
import { spacesToAccounts } from './spaces-to-accounts'

export const accountsRelations = relations(accounts, ({ one, many }) => ({
	// One-to-one: account to a user (auth)
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id],
	}),
	// Many-to-many: account to many spaces
	spacesToAccounts: many(spacesToAccounts),
	// One-to-many: account to many processes (assignedId)
	assignedProcesses: many(processes, {
		relationName: 'accountAssignedProcesses',
	}),
	// One-to-many: account to many clients
	clients: many(clients),
}))
