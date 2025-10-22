'use server'

import { db } from '@infra/db'
import { accounts } from '@infra/db/schemas/accounts'
import { type Space, spaces, spacesToAccounts } from '@infra/db/schemas/spaces'
import { createValidatedAction } from '@libs/zod/action-factory'
import { and, eq, isNull } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const inputSchema = z.object({
	accountId: z.string().min(1, 'Account ID is required'),
})

export type Input = z.input<typeof inputSchema>

export interface GetFirstSpaceActionOutput {
	success: boolean
	error?: string
	data?: Space
}

export const getFirstSpaceAction = createValidatedAction<Input, Space>(inputSchema)(
	async ({ accountId }): Promise<GetFirstSpaceActionOutput> => {
		try {
			const [row] = await db
				.select({
					id: spaces.id,
					name: spaces.name,
					created_by: spaces.created_by,
					created_at: spaces.created_at,
					updated_at: spaces.updated_at,
					deleted_at: spaces.deleted_at,
				})
				.from(spaces)
				.innerJoin(spacesToAccounts, eq(spaces.id, spacesToAccounts.spaceId))
				.innerJoin(accounts, eq(spacesToAccounts.accountId, accounts.id))
				.where(
					and(
						eq(accounts.id, accountId),
						isNull(spaces.deleted_at),
					),
				)
				.limit(1)

			if (!row) {
				return {
					success: false,
					error: 'No space found for the specified account.',
				}
			}

			const spaceSelectSchema = createSelectSchema(spaces)
			const space = spaceSelectSchema.parse(row)

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
	},
)
