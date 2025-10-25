import { nanoid } from '@libs/nanoid'
import { text } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { auditFields } from '../helpers'
import { spaceTypeEnum } from './enums'
import { core } from './schema'

export const spaces = core.table('spaces', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	name: text('name').notNull(),
	type: spaceTypeEnum('type').notNull(),
	...auditFields,
})

export const insertSpaceSchema = createInsertSchema(spaces)
