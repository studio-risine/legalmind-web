import { relations } from 'drizzle-orm'
import { integer, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers'
import { accounts } from './accounts'

export const spaces = pgTable('spaces', {
	id: uuid('id').primaryKey(),
	name: text('name'),
	...timestamps,
})

export const spacesRelations = relations(spaces, ({ many }) => ({
	spacesToAccounts: many(spacesToAccounts),
}))

export const spacesToAccounts = pgTable(
	'spaces_to_accounts',
	{
		spaceId: uuid('space_id')
			.notNull()
			.references(() => spaces.id),
		accountId: integer('account_id')
			.notNull()
			.references(() => accounts.id),
	},
	(t) => [primaryKey({ columns: [t.spaceId, t.accountId] })],
)

export const spacesToAccountsRelations = relations(
	spacesToAccounts,
	({ one }) => ({
		space: one(spaces, {
			fields: [spacesToAccounts.spaceId],
			references: [spaces.id],
		}),
		account: one(accounts, {
			fields: [spacesToAccounts.accountId],
			references: [accounts.id],
		}),
	}),
)
