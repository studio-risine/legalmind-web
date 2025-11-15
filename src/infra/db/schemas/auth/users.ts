import { boolean, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { auth } from './schema'

export const users = auth.table('users', {
	aud: text('aud'),
	banned_until: timestamp('banned_until', {
		withTimezone: true,
	}),
	created_at: timestamp('created_at', {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
	email: text('email').unique().notNull(),
	email_confirmed_at: timestamp('email_confirmed_at', {
		withTimezone: true,
	}),
	id: uuid('id').primaryKey().defaultRandom(),
	invited_at: timestamp('invited_at', {
		withTimezone: true,
	}),
	is_anonymous: boolean('is_anonymous').default(false),
	is_super_admin: boolean('is_super_admin').default(false),
	last_sign_in_at: timestamp('last_sign_in_at', {
		withTimezone: true,
	}),
	phone: text('phone'),
	phone_confirmed_at: timestamp('phone_confirmed_at', {
		withTimezone: true,
	}),
	raw_app_meta_data: jsonb('raw_app_meta_data'),
	raw_user_meta_data: jsonb('raw_user_meta_data'),
	role: text('role'),
	updated_at: timestamp('updated_at', {
		withTimezone: true,
	})
		.notNull()
		.defaultNow(),
})
