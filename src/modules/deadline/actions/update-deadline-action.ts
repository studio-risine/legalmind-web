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
		notes: true,
		priority: true,
		status: true,
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
		return { error: parsed.error.message, success: false }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { error: 'No account found.', success: false }
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
			return {
				error: 'Deadline not found or unauthorized',
				success: false,
			}
		}

		revalidatePath('/space/deadlines')
		revalidatePath(`/space/processes/${row.processId}`)

		return { data: row, success: true }
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Unknown error',
			success: false,
		}
	}
}
