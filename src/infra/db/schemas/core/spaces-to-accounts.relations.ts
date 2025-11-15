import { relations } from 'drizzle-orm'
import { accounts } from './accounts'
import { spaces } from './spaces'
import { spacesToAccounts } from './spaces-to-accounts'

export const spacesToAccountsRelations = relations(spacesToAccounts, ({ one }) => ({
	// Many-to-one: to an account
	account: one(accounts, {
		fields: [spacesToAccounts.accountId],
		references: [accounts.userId],
	}),
	// Many-to-one: to a space
	space: one(spaces, {
		fields: [spacesToAccounts.spaceId],
		references: [spaces._id],
	}),
}))
