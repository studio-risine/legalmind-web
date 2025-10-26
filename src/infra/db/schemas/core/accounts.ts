import { char, text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { users } from '../auth'
import { timestamps, uuidPrimaryKey } from '../helpers'
import { core } from './schema'

export const accounts = core.table('accounts', {
	id: uuidPrimaryKey,
	userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
	fullName: text('full_name').notNull(),
	displayName: text('display_name').notNull(),
	email: text('email').notNull().unique(),
	phoneNumber: text('phone_number').unique(),
	profilePictureUrl: text('profile_picture_url'),
	oabNumber: text('oab_number').notNull(),
	oabState: char('oab_state', { length: 2 }).notNull(),
	...timestamps,
})

export const insertAccountSchema = createInsertSchema(accounts)
