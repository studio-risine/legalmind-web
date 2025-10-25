import { primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { accounts } from './accounts'
import { core } from './schema'
import { spaces } from './spaces'

export const spacesToAccounts = core.table(
	'spaces_to_accounts',
	{
		spaceId: text('space_id')
			.notNull()
			.references(() => spaces.id, { onDelete: 'cascade' }),
		accountId: uuid('account_id')
			.notNull()
			.references(() => accounts.userId, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.spaceId, t.accountId] }),
	}),
)
