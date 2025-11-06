'use server'

import { db } from '@infra/db'
import { type Deadline, deadlines } from '@infra/db/schemas/core'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq, isNull } from 'drizzle-orm'

export interface GetDeadlineByIdOutput {
	data: Deadline | null
	error?: string
}

export async function getDeadlineByIdAction(
	id: string,
): Promise<GetDeadlineByIdOutput> {
	try {
		const accountId = await getCurrentAccountId()
		if (!accountId) {
			return { data: null, error: 'No account context.' }
		}

		const [row] = await db
			.select()
			.from(deadlines)
			.where(
				and(
					eq(deadlines.id, id),
					eq(deadlines.accountId, accountId),
					isNull(deadlines.deletedAt),
				),
			)
			.limit(1)

		if (!row) {
			return { data: null, error: 'Deadline not found' }
		}

		return { data: row }
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
