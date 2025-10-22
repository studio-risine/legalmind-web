'use server'

import { db } from '@infra/db'
import { spaces, spacesToAccounts } from '@infra/db/schemas'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { eq } from 'drizzle-orm'

export async function getSpacesAction() {
	const accountId = await getCurrentAccountId()

	if (!accountId) {
		throw new Error('User not authenticated')
	}

	const userSpaces = await db
		.select({
			id: spaces.id,
			name: spaces.name,
			slug: spaces.slug,
			created_by: spaces.created_by,
		})
		.from(spaces)
		.innerJoin(spacesToAccounts, eq(spaces.id, spacesToAccounts.spaceId))
		.where(eq(spacesToAccounts.accountId, accountId))

	return userSpaces
}

export type GetSpacesOutput = Awaited<ReturnType<typeof getSpacesAction>>
