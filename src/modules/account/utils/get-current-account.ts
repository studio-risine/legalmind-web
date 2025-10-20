'use server'

import { db } from '@infra/db'
import { accounts } from '@infra/db/schemas/accounts'

/**
 * TEMPORARY: Resolve the current account id.
 * Currently returns the first account found.
 * TODO: Replace with real resolution based on authenticated user/session & selected space/team.
 */
export async function getCurrentAccountId(): Promise<number | null> {
	try {
		const [account] = await db
			.select({ id: accounts.id })
			.from(accounts)
			.limit(1)
		return account?.id ?? null
	} catch (_err) {
		return null
	}
}
