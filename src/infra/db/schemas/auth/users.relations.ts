import { relations } from 'drizzle-orm'
import { accounts } from '../core/accounts'
import { users } from './users'

export const usersRelations = relations(users, ({ one }) => ({
	// One-to-one: user tem um account
	// Este é o único relacionamento necessário pois auth.users é apenas para autenticação
	// Toda a lógica de negócio está em core.accounts
	account: one(accounts, {
		fields: [users.id],
		references: [accounts.userId],
	}),
}))
