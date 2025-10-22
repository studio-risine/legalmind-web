'use server'

import { db } from '@infra/db'
import { type Account, accounts } from '@infra/db/schemas/accounts'
import { and, eq, isNull } from 'drizzle-orm'
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const accountUpdateDataSchema = createUpdateSchema(accounts).pick({
	name: true,
	displayName: true,
	email: true,
})

const accountUpdateSchema = z
	.object({ id: z.string().min(1) })
	.merge(accountUpdateDataSchema)

export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>

export interface UpdateAccountOutput {
	success: boolean
	data?: Account
	error?: string
}

export async function updateAccountAction(
	input: AccountUpdateInput,
): Promise<UpdateAccountOutput> {
	const parsed = accountUpdateSchema.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const { id, ...updateData } = parsed.data

		// Check if account exists and is not deleted
		const existingAccount = await db
			.select({ id: accounts.id })
			.from(accounts)
			.where(and(eq(accounts.id, id), isNull(accounts.deleted_at)))
			.limit(1)

		if (!existingAccount.length) {
			return { success: false, error: 'Account not found.' }
		}

		// Update account
		const [updatedAccount] = await db
			.update(accounts)
			.set({ ...updateData, updated_at: new Date() })
			.where(eq(accounts.id, id))
			.returning()

		if (!updatedAccount) {
			return { success: false, error: 'Failed to update account.' }
		}

		const accountSelectSchema = createSelectSchema(accounts)
		const validatedAccount = accountSelectSchema.parse(updatedAccount)

		revalidatePath('/dashboard')
		return { success: true, data: validatedAccount }
	} catch (error) {
		console.error('Failed to update account:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to update account',
		}
	}
}
