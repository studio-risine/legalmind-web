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
		oabNumber: z.string().min(1, {
			message: 'O número da OAB é obrigatório',
		}),
		oabState: z.string().length(2, {
			message: 'O estado da OAB é obrigatório',
		}),
		phoneNumber: z.string().optional(),
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
			error: inputParsed.error,
			message: formatZodError(inputParsed.error),
			success: false,
		}
	}

	const { data: user, error } = await userAuthAction()

	if (!user?.id || !user?.email) {
		return {
			data: null,
			error: error,
			message: 'User not authenticated',
			success: false,
		}
	}

	const accountRepository = makeAccountRepository()
	const account = await accountRepository.findById(input.accountId)

	if (!account) {
		return {
			data: null,
			message: 'Conta não encontrada.',
			success: false,
		}
	}

	if (account.userId !== user.id) {
		return {
			data: null,
			message: 'Você não tem permissão para atualizar esta conta.',
			success: false,
		}
	}

	const result = await accountRepository.update({
		accountId: input.accountId,
		data: input.data,
	})

	if (!result.accountId) {
		return {
			data: null,
			message:
				'Ocorreu um erro ao atualizar a conta, tente novamente mais tarde.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: result.accountId,
	})

	if (!outputParsed.success) {
		return {
			data: null,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
			success: false,
		}
	}

	revalidatePath('/account')

	return {
		data: result.accountId,
		success: true,
	}
}

export const updateAccountAction = cache(handler)
