import { sql } from 'drizzle-orm'
import { accounts } from './accounts'
import { core } from './schema'

export const viewAccounts = core.view('view_accounts').as((qb) =>
	qb
		.select({
			accountCreatedAt: sql`${accounts.createdAt}`.as('account_created_at'),
			accountUpdatedAt: accounts.updatedAt,
			displayName: accounts.displayName,
			email: accounts.email,
			fullName: accounts.fullName,
			oabNumber: accounts.oabNumber,
			oabState: accounts.oabState,
			phone: accounts.phoneNumber,
			profilePictureUrl: accounts.profilePictureUrl,
			userId: accounts.userId,
		})
		.from(accounts),
)

export const viewAccountsPublic = core.view('view_accounts_public').as((qb) =>
	qb
		.select({
			displayName: accounts.displayName,
			profilePictureUrl: accounts.profilePictureUrl,
			userId: accounts.userId,
		})
		.from(accounts),
)
