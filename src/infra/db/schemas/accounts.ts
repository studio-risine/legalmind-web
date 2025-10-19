import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers'
import { spacesToAccounts } from './spaces'

export const accounts = pgTable('accounts', {
	id: integer('id').primaryKey(),
	displayName: text('display_name'),
	name: text('name'),
	email: text('email').unique(),

	...timestamps,
})

export const accountsRelations = relations(accounts, ({ many }) => ({
	spacesToAccounts: many(spacesToAccounts),
}))
