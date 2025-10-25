'use server'

import { db } from '@infra/db'
import { accounts } from '@infra/db/schemas/accounts'
import { type Space, spaces, spacesToAccounts } from '@infra/db/schemas/spaces'
import { createValidatedAction } from '@libs/zod/action-factory'
import { and, eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const inputSchema = z.object({
	accountId: z.string().min(1, 'Account ID is required'),
})

export type Input = z.input<typeof inputSchema>

export interface GetFirstSpaceActionOutput {
	data?: Space
	success: boolean
	error?: string
}

export const getFirstSpaceAction = createValidatedAction<Input, Space>(
	inputSchema,
)(async ({ accountId }): Promise<GetFirstSpaceActionOutput> => {
	try {
		const [account] = await db
			.select({
				id: spaces.id,
				name: spaces.name,
				created_by: spaces.createdBy,
				created_at: spaces.createdAt,
				updated_at: spaces.updatedAt,
			})
			.from(spaces)
			.innerJoin(spacesToAccounts, eq(spaces.id, spacesToAccounts.spaceId))
			.innerJoin(accounts, eq(spacesToAccounts.accountId, accounts.id))
			.where(and(eq(accounts.id, accountId)))
			.limit(1)

		if (!account) {
			return {
				success: false,
				error: 'No spaces found for this account.',
			}
		}

		const spaceSelectSchema = createSelectSchema(spaces)
		const space = spaceSelectSchema.parse(account)

		return {
			success: true,
			data: space,
		}
	} catch (error) {
		console.error('Failed to get first space:', error)

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred.',
		}
	}
})
