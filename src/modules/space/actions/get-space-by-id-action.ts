'use server'

import { db } from '@infra/db'
import { type Space, spaces, spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq, isNull } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const getSpaceByIdSchema = z.object({
	id: z.string().min(1),
})

export type GetSpaceByIdInput = z.input<typeof getSpaceByIdSchema>

export async function getSpaceByIdAction(
	input: GetSpaceByIdInput,
): Promise<Space | null> {
	const parsed = getSpaceByIdSchema.safeParse(input)

	if (!parsed.success) {
		return null
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return null
		}

		const { id } = parsed.data

		const [row] = await db
			.select()
			.from(spaces)
			.innerJoin(spacesToAccounts, eq(spaces.id, spacesToAccounts.spaceId))
			.where(
				and(
					eq(spaces.id, id),
					eq(spacesToAccounts.accountId, accountId),
					isNull(spaces.deleted_at),
				),
			)
			.limit(1)

		if (!row) {
			return null
		}

		const spaceSelectSchema = createSelectSchema(spaces)
		const space = spaceSelectSchema.parse(row.spaces)

		return space
	} catch (error) {
		console.error('Failed to get space:', error)
		return null
	}
}
