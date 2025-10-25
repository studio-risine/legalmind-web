import { text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { users } from '../auth'
import { spaceTypeEnum } from './enums'
import { core } from './schema'

export const spaces = core.table('spaces', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	type: spaceTypeEnum('type').notNull(),
})

export const insertSpaceSchema = createInsertSchema(spaces)
