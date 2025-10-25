import { eq, sql } from 'drizzle-orm'
import { users } from '../auth'
import { accounts } from './accounts'
import { core } from './schema'

export const viewAccounts = core.view('view_accounts').as((qb) =>
	qb
		.select({
			userId: users.id,
			email: users.email,
			phone: users.phone,
			userCreatedAt: sql`${users.created_at}`.as('user_created_at'),
			fullName: accounts.fullName,
			displayName: accounts.displayName,
			profilePictureUrl: accounts.profilePictureUrl,
			oabNumber: accounts.oabNumber,
			oabState: accounts.oabState,
			accountCreatedAt: sql`${accounts.createdAt}`.as('account_created_at'),
			accountUpdatedAt: accounts.updatedAt,
		})
		.from(accounts)
		.leftJoin(users, eq(users.id, accounts.userId)),
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
