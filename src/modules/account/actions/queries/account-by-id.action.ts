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
			success: false,
			error: inputParsed.error,
			message: formatZodError(inputParsed.error),
		}
	}

	const accountRepository = makeAccountRepository()
	const account = await accountRepository.findById(inputParsed.data.id)

	if (!account) {
		return {
			data: null,
			success: false,
			message: 'Conta não encontrada.',
		}
	}

	const { data: user, error } = await userAuthAction()

	if (!user?.id) {
		return {
			data: null,
			success: false,
			error: error,
			message: 'User not authenticated',
		}
	}

	if (account.userId !== user.id) {
		return {
			data: null,
			success: false,
			message: 'Você não tem permissão para acessar esta conta.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: account })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	return {
		data: account,
		success: true,
	}
}

export const accountByIdAction = cache(handler)
