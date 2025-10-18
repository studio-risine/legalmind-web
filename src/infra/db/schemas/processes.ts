import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from '../helpers'

export const processes = pgTable('processes', {
	id: uuid('id').primaryKey(),
	name: text('name'),
	...timestamps,
})
