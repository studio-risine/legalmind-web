'use server'

import { ResourceNotFoundError } from '@errors/resource-not-found-error'
import { db } from '@infra/db'
import { type Account, accounts } from '@infra/db/schemas/accounts'
import { createValidatedActionWithOutput } from '@libs/zod'
import { eq } from 'drizzle-orm'
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

const inputSchema = createUpdateSchema(accounts).pick({
	id: true,
	displayName: true,
	email: true,
	phoneNumber: true,
	oabNumber: true,
	oabState: true,
}).required({ id: true })

const outputSchema = createSelectSchema(accounts)

export type UpdateAccountInput = z.input<typeof inputSchema>

const handleAction = async (input: UpdateAccountInput): Promise<Account> => {
	const { id, displayName, email, phoneNumber, oabNumber, oabState } = input
	// Check if account exists and is not deleted
	const existingAccount = await db
		.select({ id: accounts.id })
		.from(accounts)
		.where(eq(accounts.id, id))
		.limit(1)

	if (!existingAccount.length) {
		throw new ResourceNotFoundError('Account')
	}

	// Update account
	const [updatedAccount] = await db
		.update(accounts)
		.set({ 
			displayName,
			email,
			phoneNumber,
			oabNumber,
			oabState,
			updatedAt: new Date() 
		})
		.where(eq(accounts.id, id))
		.returning()

	if (!updatedAccount) {
		throw new Error('Failed to update account')
	}

	revalidatePath('/onboarding')
	revalidatePath('/dashboard')
	
	return updatedAccount
}

export const updateAccountAction = createValidatedActionWithOutput(
	inputSchema,
	outputSchema,
)(handleAction)
