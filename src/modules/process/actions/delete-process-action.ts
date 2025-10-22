'use server'

import { db } from '@infra/db'
import { processes } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
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

		// First, get the process to check its space_id
		const [existingProcess] = await db
			.select({ space_id: processes.space_id })
			.from(processes)
			.where(eq(processes.id, id))
			.limit(1)

		if (!existingProcess) {
			return { success: false, error: 'Process not found' }
		}

		// Verify if the account is a member of the space
		const [membership] = await db
			.select()
			.from(spacesToAccounts)
			.where(
				and(
					eq(spacesToAccounts.spaceId, existingProcess.space_id),
					eq(spacesToAccounts.accountId, accountId),
				),
			)
			.limit(1)

		if (!membership) {
			return {
				success: false,
				error: 'Access denied: not a member of this space',
			}
		}

		const result = await db
			.update(processes)
			.set({ deleted_at: new Date() })
			.where(eq(processes.id, id))
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
