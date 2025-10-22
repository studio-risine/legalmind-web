import { relations } from 'drizzle-orm'
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import { uuidv7 } from 'uuidv7'
import type z from 'zod'
import { timestamps } from '../helpers'
import { accounts } from './accounts'
import { processes } from './processes'

export const spaces = pgTable('spaces', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	name: text('name'),
	created_by: text('created_by')
		.notNull()
		.references(() => accounts.id),
	...timestamps,
})

export const spacesRelations = relations(spaces, ({ one, many }) => ({
	spacesToAccounts: many(spacesToAccounts),
	processes: many(processes),
	creator: one(accounts, {
		fields: [spaces.created_by],
		references: [accounts.id],
	}),
}))

export const spacesToAccounts = pgTable(
	'spaces_to_accounts',
	{
		spaceId: text('space_id')
			.notNull()
			.references(() => spaces.id),
		accountId: text('account_id')
			.notNull()
			.references(() => accounts.id),
	},
	(t) => [primaryKey({ columns: [t.spaceId, t.accountId] })],
)

export const spacesToAccountsRelations = relations(
	spacesToAccounts,
	({ one }) => ({
		space: one(spaces, {
			fields: [spacesToAccounts.spaceId],
			references: [spaces.id],
		}),
		account: one(accounts, {
			fields: [spacesToAccounts.accountId],
			references: [accounts.id],
		}),
	}),
)

const spaceSelectSchema = createSelectSchema(spaces)
export type Space = z.output<typeof spaceSelectSchema>

export const spaceInsertSchema = createInsertSchema(spaces)
export type SpaceInsert = z.input<typeof spaceInsertSchema>

export const spaceUpdateSchema = createUpdateSchema(spaces)
export type SpaceUpdate = z.output<typeof spaceUpdateSchema>
