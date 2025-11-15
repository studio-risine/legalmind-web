import { char, text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type z from 'zod'
import { users } from '../auth'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { core } from './schema'

export const accounts = core.table('accounts', {
	_id: uuidPrimaryKey,
	displayName: text('display_name').notNull(),
	email: text('email').notNull().unique(),
	fullName: text('full_name'),
	oabNumber: text('oab_number'),
	oabState: char('oab_state', { length: 2 }),
	phoneNumber: text('phone_number').unique(),
	profilePictureUrl: text('profile_picture_url'),
	userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
	...timestamps,
})

const accountSelectSchema = createSelectSchema(accounts)
export type Account = z.output<typeof accountSelectSchema>

export const insertAccountSchema = createInsertSchema(accounts)
export type InsertAccount = z.input<typeof insertAccountSchema>

export const updateAccountSchema = createUpdateSchema(accounts)
export type UpdateAccount = z.output<typeof updateAccountSchema>
