'use server'

import { db } from '@infra/db'
import {
	type Deadline,
	deadlines,
	insertDeadlineSchema,
} from '@infra/db/schemas/core'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

const deadlineInsertInput = insertDeadlineSchema
	.pick({
		processId: true,
		dueDate: true,
		status: true,
		priority: true,
		notes: true,
	})
	.required({
		processId: true,
		dueDate: true,
	})

export type DeadlineInsertInput = z.infer<typeof deadlineInsertInput>

export interface InsertDeadlineOutput {
	success: boolean
	data?: Deadline
	error?: string
}

export async function insertDeadlineAction(
	input: DeadlineInsertInput,
): Promise<InsertDeadlineOutput> {
	const parsed = deadlineInsertInput.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return {
				success: false,
				error: 'No account found to associate deadline.',
			}
		}

		const [row] = await db
			.insert(deadlines)
			.values({ ...parsed.data, accountId })
			.returning()

		if (!row) {
			return { success: false, error: 'Failed to create deadline' }
		}

		revalidatePath('/space/deadlines')
		revalidatePath(`/space/processes/${parsed.data.processId}`)

		return { success: true, data: row }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
