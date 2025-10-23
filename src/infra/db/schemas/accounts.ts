import { relations } from 'drizzle-orm'
import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import type { z } from 'zod'
import { timestamps } from '../helpers'
import { spacesToAccounts } from './spaces'

export const accounts = pgTable('accounts', {
	id: uuid('id').primaryKey(),
	displayName: text('display_name'),
	fullName: text('full_name'),
	email: varchar('email', { length: 255 }).unique(),
	phoneNumber: varchar('phone_number', { length: 20 }),
	profilePictureUrl: text('profile_picture_url'),

	oabNumber: varchar('oab_number', { length: 20 }),
	oabState: varchar('oab_state', { length: 2 }),

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
