import { relations } from 'drizzle-orm'
import { accounts } from './accounts'
import { clients } from './clients'
import { processes } from './processes'
import { spacesToAccounts } from './spaces-to-accounts'

export const accountsRelations = relations(accounts, ({ many }) => ({
	// Many-to-many: account to many spaces
	spacesToAccounts: many(spacesToAccounts),
	// One-to-many: account to many processes (assignedId)
	assignedProcesses: many(processes, {
		relationName: 'accountAssignedProcesses',
	}),
	// One-to-many: account to many clients
	clients: many(clients),
}))
