import { relations } from 'drizzle-orm'
import { accounts } from './accounts'
import { processes } from './processes'
import { spaces } from './spaces'
import { spacesToAccounts } from './spaces-to-accounts'

export const spacesRelations = relations(spaces, ({ one, many }) => ({
	// One-to-one: space created by user
	creator: one(accounts, {
		fields: [spaces.createdBy],
		references: [accounts.userId],
	}),
	// One-to-many: space to many processes
	processes: many(processes),
	// Many-to-many: space to many accounts
	spacesToAccounts: many(spacesToAccounts),
}))
