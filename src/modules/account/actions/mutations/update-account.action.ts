'use server'

import { updateAccountSchema } from '@infra/db/schemas'
import { makeAccountRepository } from '@modules/account/factories'
import type { UpdateAccountInput } from '@modules/account/repositories/account.repository'
import { createValidatedActionWithOutput } from '@utils/factories/action-factory'
import { revalidatePath } from 'next/cache'
import z from 'zod'

const updateSchema = z.object({
	accountId: z.string().min(1),
	data: updateAccountSchema,
})

const outputSchema = z.object({
	success: z.boolean().optional(),
	error: z.string().optional(),
	data: z
		.object({
			accountId: z.string().nullable(),
		})
		.optional(),
})

const handler = async ({ accountId, data }: UpdateAccountInput) => {
	if (!accountId || typeof accountId !== 'string') {
		throw new Error('Insert ID is required and must be a string')
	}

	const accountRepository = makeAccountRepository()

	const account = await accountRepository.update({
		accountId,
		data,
	})

	revalidatePath('/account')

	return {
		data: {
			success: true,
			accountId: account.accountId,
		},
	}
}

export const updateAccountAction = createValidatedActionWithOutput(
	updateSchema,
	outputSchema,
)(handler)
