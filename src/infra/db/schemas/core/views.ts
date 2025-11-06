import { sql } from 'drizzle-orm'
import { accounts } from './accounts'
import { core } from './schema'

export const viewAccounts = core.view('view_accounts').as((qb) =>
	qb
		.select({
			userId: accounts.userId,
			email: accounts.email,
			phone: accounts.phoneNumber,
			fullName: accounts.fullName,
			displayName: accounts.displayName,
			profilePictureUrl: accounts.profilePictureUrl,
			oabNumber: accounts.oabNumber,
			oabState: accounts.oabState,
			accountCreatedAt: sql`${accounts.createdAt}`.as('account_created_at'),
			accountUpdatedAt: accounts.updatedAt,
		})
		.from(accounts),
)

export const viewAccountsPublic = core.view('view_accounts_public').as((qb) =>
	qb
		.select({
			userId: accounts.userId,
			displayName: accounts.displayName,
			profilePictureUrl: accounts.profilePictureUrl,
		})
		.from(accounts),
)
