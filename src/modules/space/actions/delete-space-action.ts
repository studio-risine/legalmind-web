'use server'

import { db } from '@infra/db'
import { spaces, spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const deleteSpaceSchema = z.object({
	id: z.string().min(1),
})

export type DeleteSpaceInput = z.infer<typeof deleteSpaceSchema>

export interface DeleteSpaceOutput {
	success: boolean
	error?: string
}

export async function deleteSpaceAction(
	input: DeleteSpaceInput,
): Promise<DeleteSpaceOutput> {
	const parsed = deleteSpaceSchema.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { success: false, error: 'No account found.' }
		}

		const { id } = parsed.data

		// Check if space exists and belongs to current account
		const spaceExists = await db
			.select({ id: spaces.id })
			.from(spaces)
			.innerJoin(spacesToAccounts, eq(spaces.id, spacesToAccounts.spaceId))
			.where(and(eq(spaces.id, id), eq(spacesToAccounts.accountId, accountId)))
			.limit(1)

		if (!spaceExists.length) {
			return { success: false, error: 'Space not found or access denied.' }
		}

		// Perform soft delete
		const [deletedSpace] = await db
			.update(spaces)
			.set({ deleted_at: new Date() })
			.where(eq(spaces.id, id))
			.returning({ id: spaces.id })

		if (!deletedSpace) {
			return { success: false, error: 'Failed to delete space.' }
		}

		revalidatePath('/dashboard')
		return { success: true }
	} catch (error) {
		console.error('Failed to delete space:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete space',
		}
	}
}
