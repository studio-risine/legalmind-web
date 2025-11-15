'use server'

import { db } from '@infra/db'
import { deadlines } from '@infra/db/schemas/core'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface DeleteDeadlineOutput {
	success: boolean
	error?: string
}

export async function deleteDeadlineAction(
	id: string,
): Promise<DeleteDeadlineOutput> {
	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { error: 'No account found.', success: false }
		}

		// Soft delete: set deletedAt timestamp
		const [row] = await db
			.update(deadlines)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(deadlines.id, id),
					eq(deadlines.accountId, accountId),
					isNull(deadlines.deletedAt),
				),
			)
			.returning()

		if (!row) {
			return {
				error: 'Deadline not found or already deleted',
				success: false,
			}
		}

		revalidatePath('/space/deadlines')
		revalidatePath(`/space/processes/${row.processId}`)

		return { success: true }
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Unknown error',
			success: false,
		}
	}
}
