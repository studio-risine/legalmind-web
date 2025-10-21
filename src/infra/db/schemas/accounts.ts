import { relations } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { timestamps } from '../helpers'
import { spacesToAccounts } from './spaces'

export const accounts = pgTable('accounts', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	displayName: text('display_name'),
	name: text('name'),
	email: text('email').unique(),

	...timestamps,
})

export const accountsRelations = relations(accounts, ({ many }) => ({
	spacesToAccounts: many(spacesToAccounts),
}))
