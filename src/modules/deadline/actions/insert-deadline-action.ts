'use server'

import { db } from '@infra/db'
import { type Deadline, deadlines, insertDeadlineSchema } from '@infra/db/schemas/core'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

const deadlineInsertInput = insertDeadlineSchema
	.pick({
		dueDate: true,
		notes: true,
		priority: true,
		processId: true,
		status: true,
	})
	.required({
		dueDate: true,
		processId: true,
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
		return { error: parsed.error.message, success: false }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return {
				error: 'No account found to associate deadline.',
				success: false,
			}
		}

		const [row] = await db
			.insert(deadlines)
			.values({ ...parsed.data, accountId })
			.returning()

		if (!row) {
			return { error: 'Failed to create deadline', success: false }
		}

		revalidatePath('/space/deadlines')
		revalidatePath(`/space/processes/${parsed.data.processId}`)

		return { data: row, success: true }
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : 'Unknown error',
			success: false,
		}
	}
}
