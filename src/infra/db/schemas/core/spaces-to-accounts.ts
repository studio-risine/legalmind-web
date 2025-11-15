import { primaryKey, text, uuid } from 'drizzle-orm/pg-core'
import { createdAtTimestamp } from '../helpers'
import { accounts } from './accounts'
import { core } from './schema'
import { spaces } from './spaces'

export const spacesToAccounts = core.table(
	'spaces_to_accounts',
	{
		accountId: uuid('account_id')
			.notNull()
			.references(() => accounts._id, { onDelete: 'cascade' }),
		createdAt: createdAtTimestamp,
		spaceId: text('space_id')
			.notNull()
			.references(() => spaces._id, { onDelete: 'cascade' }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.spaceId, t.accountId] }),
	}),
)
