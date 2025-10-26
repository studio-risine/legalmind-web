import { relations } from 'drizzle-orm'
import { accounts } from '../core/accounts'
import { users } from './users'

export const usersRelations = relations(users, ({ one }) => ({
	// One-to-one: user tem um account
	account: one(accounts, {
		fields: [users.id],
		references: [accounts.userId],
	}),
}))
