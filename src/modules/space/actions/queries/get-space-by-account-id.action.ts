'use server'

import type { Space } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { makeSpaceRepository } from '@modules/space/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	accountId: string
}

export interface Output {
	data: Space | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	accountId: z.string().uuid('Invalid account id'),
})

const outputSchema = z.object({
	data: z.custom<Space>().nullable(),
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

	if (!user?.id) {
		return {
			data: null,
			error: error,
			message: 'User not authenticated',
			success: false,
		}
	}

	const accountRepository = makeAccountRepository()
	const account = await accountRepository.findById(inputParsed.data.accountId)

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
			message: 'Você não tem permissão para acessar este space.',
			success: false,
		}
	}

	const spaceRepository = makeSpaceRepository()
	const space = await spaceRepository.findByAccountId({
		accountId: inputParsed.data.accountId,
	})

	if (!space) {
		return {
			data: null,
			message: 'Space não encontrado.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: space,
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
		data: space,
		success: true,
	}
}

export const getSpaceByAccountIdAction = cache(handler)
