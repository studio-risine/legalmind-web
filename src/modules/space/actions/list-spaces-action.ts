'use server'

import { db } from '@infra/db'
import { type Space, spaces, spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq, isNull } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'

export async function listSpacesAction(): Promise<Space[]> {
	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return []
		}

		const rows = await db
			.select()
			.from(spaces)
			.innerJoin(spacesToAccounts, eq(spaces.id, spacesToAccounts.spaceId))
			.where(
				and(
					eq(spacesToAccounts.accountId, accountId),
					isNull(spaces.deleted_at),
				),
			)
			.orderBy(spaces.created_at)

		const spaceSelectSchema = createSelectSchema(spaces)
		return rows.map((row) => spaceSelectSchema.parse(row.spaces))
	} catch (error) {
		console.error('Failed to list spaces:', error)
		return []
	}
}
