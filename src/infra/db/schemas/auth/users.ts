import { boolean, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { auth } from './schema'

export const users = auth.table('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').unique().notNull(),
	phone: text('phone'),
	email_confirmed_at: timestamp('email_confirmed_at', { withTimezone: true }),
	phone_confirmed_at: timestamp('phone_confirmed_at', { withTimezone: true }),
	created_at: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updated_at: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	last_sign_in_at: timestamp('last_sign_in_at', { withTimezone: true }),
	banned_until: timestamp('banned_until', { withTimezone: true }),
	is_super_admin: boolean('is_super_admin').default(false),
	is_anonymous: boolean('is_anonymous').default(false),
	raw_user_meta_data: jsonb('raw_user_meta_data'),
	raw_app_meta_data: jsonb('raw_app_meta_data'),
	aud: text('aud'),
	role: text('role'),
	invited_at: timestamp('invited_at', { withTimezone: true }),
})
