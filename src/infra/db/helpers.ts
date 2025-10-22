import { text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const timestamps = {
	updated_at: timestamp(),
	created_at: timestamp().defaultNow().notNull(),
	deleted_at: timestamp(),
}

export const id = {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
}
