'use server'

import { db } from '@infra/db'
import { processes } from '@infra/db/schemas/processes'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const deleteProcessInput = z.object({ id: z.string().min(1) })

export interface DeleteProcessOutput {
	success: boolean
	error?: string
}

export async function deleteProcessAction(
	input: z.infer<typeof deleteProcessInput>,
): Promise<DeleteProcessOutput> {
	const { id } = deleteProcessInput.parse(input)

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { success: false, error: 'No account found' }
		}

		const result = await db
			.update(processes)
			.set({ deleted_at: new Date() })
			.where(and(eq(processes.id, id), eq(processes.account_id, accountId)))
			.returning()

		if (!result || result.length === 0) {
			return { success: false, error: 'Process not found or access denied' }
		}

		revalidatePath('/dashboard/processes')

		return { success: true }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
