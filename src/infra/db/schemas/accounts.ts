import { relations } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import type { z } from 'zod'
import { timestamps } from '../helpers'
import { spacesToAccounts } from './spaces'

export const accounts = pgTable('accounts', {
	id: text('id').primaryKey(),
	displayName: text('display_name'),
	name: text('name'),
	lastName: text('last_name'),
	email: text('email').unique(),

	...timestamps,
})

export const accountsRelations = relations(accounts, ({ many }) => ({
	spacesToAccounts: many(spacesToAccounts),
}))

const accountSelectSchema = createSelectSchema(accounts)
export type Account = z.output<typeof accountSelectSchema>

export const accountInsertSchema = createInsertSchema(accounts)
export type AccountInsert = z.input<typeof accountInsertSchema>

export const accountUpdateSchema = createUpdateSchema(accounts)
export type AccountUpdate = z.output<typeof accountUpdateSchema>
