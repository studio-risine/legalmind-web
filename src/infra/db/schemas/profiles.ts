import { pgTable, text } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../helpers'

// Profiles acts as a proxy 1:1 to Supabase auth.users
// Populate/sync via triggers or application logic
export const profiles = pgTable('profiles', {
	...id, // mirrors auth.users.id
	...timestamps,
	email: text('email'),
	name: text('name'),
})
