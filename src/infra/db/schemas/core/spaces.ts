import { nanoid } from '@libs/nanoid'
import { text } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import type z from 'zod'
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

const spaceSelectSchema = createSelectSchema(spaces)
export type Space = z.output<typeof spaceSelectSchema>

export const insertSpaceSchema = createInsertSchema(spaces)
export type InsertSpace = z.input<typeof insertSpaceSchema>
