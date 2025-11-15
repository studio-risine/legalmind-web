'use server'

import type { Account } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
}

export interface Output {
	data: Account | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	id: z.uuid('Invalid account id'),
})

const outputSchema = z.object({
	data: z.custom<Account>().nullable(),
})

async function handler(input: Input): Promise<Output> {
	const inputParsed = inputSchema.safeParse(input)

	if (!inputParsed.success) {
		return {
			data: null,
			error: inputParsed.error,
			message: formatZodError(inputParsed.error),
			success: false,
		}
	}

	const accountRepository = makeAccountRepository()
	const account = await accountRepository.findById(inputParsed.data.id)

	if (!account) {
		return {
			data: null,
			message: 'Conta não encontrada.',
			success: false,
		}
	}

	const { data: user, error } = await userAuthAction()

	if (!user?.id) {
		return {
			data: null,
			error: error,
			message: 'User not authenticated',
			success: false,
		}
	}

	if (account.userId !== user.id) {
		return {
			data: null,
			message: 'Você não tem permissão para acessar esta conta.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: account,
	})

	if (!outputParsed.success) {
		return {
			data: null,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
			success: false,
		}
	}

	return {
		data: account,
		success: true,
	}
}

export const accountByIdAction = cache(handler)
