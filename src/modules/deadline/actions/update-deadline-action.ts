'use server'

import { db } from '@infra/db'
import {
	type Deadline,
	deadlines,
	insertDeadlineSchema,
} from '@infra/db/schemas/core'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

const deadlineUpdateInput = insertDeadlineSchema
	.pick({
		dueDate: true,
		status: true,
		priority: true,
		notes: true,
	})
	.partial()

export type DeadlineUpdateInput = z.infer<typeof deadlineUpdateInput>

export interface UpdateDeadlineOutput {
	success: boolean
	data?: Deadline
	error?: string
}

export async function updateDeadlineAction(
	id: string,
	input: DeadlineUpdateInput,
): Promise<UpdateDeadlineOutput> {
	const parsed = deadlineUpdateInput.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { success: false, error: 'No account found.' }
		}

		const [row] = await db
			.update(deadlines)
			.set({ ...parsed.data, updatedAt: new Date() })
			.where(
				and(
					eq(deadlines.id, id),
					eq(deadlines.accountId, accountId),
					isNull(deadlines.deletedAt),
				),
			)
			.returning()

		if (!row) {
			return { success: false, error: 'Deadline not found or unauthorized' }
		}

		revalidatePath('/space/deadlines')
		revalidatePath(`/space/processes/${row.processId}`)

		return { success: true, data: row }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
