import { text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const timestamps = {
	updatedAt: timestamp('updated_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
}

export const id = {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
}
