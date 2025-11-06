'use server'

import type { UpdateAccount } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	accountId: string
	data: UpdateAccount
}

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	accountId: z.string().min(1, {
		message: 'O ID da conta é obrigatório',
	}),
	data: z.object({
		displayName: z.string().min(2).max(100),
		phoneNumber: z.string().optional(),
		oabNumber: z.string().min(1, {
			message: 'O número da OAB é obrigatório',
		}),
		oabState: z.string().length(2, {
			message: 'O estado da OAB é obrigatório',
		}),
	}),
})

const outputSchema = z.object({
	data: z.uuid(),
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

	const { data: user, error } = await userAuthAction()

	if (!user?.id || !user?.email) {
		return {
			data: null,
			success: false,
			error: error,
			message: 'User not authenticated',
		}
	}

	const accountRepository = makeAccountRepository()
	const account = await accountRepository.findById(input.accountId)

	if (!account) {
		return {
			data: null,
			success: false,
			message: 'Conta não encontrada.',
		}
	}

	if (account.userId !== user.id) {
		return {
			data: null,
			success: false,
			message: 'Você não tem permissão para atualizar esta conta.',
		}
	}

	const result = await accountRepository.update({
		accountId: input.accountId,
		data: input.data,
	})

	if (!result.accountId) {
		return {
			data: null,
			success: false,
			message:
				'Ocorreu um erro ao atualizar a conta, tente novamente mais tarde.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: result.accountId })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	revalidatePath('/account')

	return {
		data: result.accountId,
		success: true,
	}
}

export const updateAccountAction = cache(handler)
