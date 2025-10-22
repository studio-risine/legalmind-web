'use server'

import { db } from '@infra/db'
import { accounts } from '@infra/db/schemas/accounts'
import { and, eq, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const deleteAccountSchema = z.object({
	id: z.string().min(1),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>

export interface DeleteAccountOutput {
	success: boolean
	error?: string
}

export async function deleteAccountAction(
	input: DeleteAccountInput,
): Promise<DeleteAccountOutput> {
	const parsed = deleteAccountSchema.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const { id } = parsed.data

		const existingAccount = await db
			.select({ id: accounts.id })
			.from(accounts)
			.where(and(eq(accounts.id, id), isNull(accounts.deleted_at)))
			.limit(1)

		if (!existingAccount.length) {
			return { success: false, error: 'Account not found.' }
		}

		const [deletedAccount] = await db
			.update(accounts)
			.set({ deleted_at: new Date() })
			.where(eq(accounts.id, id))
			.returning({ id: accounts.id })

		if (!deletedAccount) {
			return { success: false, error: 'Failed to delete account.' }
		}

		revalidatePath('/dashboard')

		return { success: true }
	} catch (error) {
		console.error('Failed to delete account:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to delete account',
		}
	}
}
