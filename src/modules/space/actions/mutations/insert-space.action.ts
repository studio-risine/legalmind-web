'use server'

import type { InsertSpace } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { makeSpaceRepository } from '@modules/space/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	accountId: string
	name: string
	type: InsertSpace['type']
	description?: string
}

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	accountId: z.uuid(),
	name: z
		.string()
		.min(2, 'O nome do space é obrigatório e deve ter ao menos 2 caracteres')
		.max(100),
	type: z.enum(['INDIVIDUAL', 'FIRM', 'DEPARTMENT']),
	description: z.string().optional(),
})

const outputSchema = z.object({
	data: z.string(),
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
			message: 'Você não tem permissão para criar um space com esta conta.',
		}
	}

	const spaceRepository = makeSpaceRepository()

	const result = await spaceRepository.insert({
		name: input.name,
		type: input.type,
		createdBy: input.accountId,
	})

	if (!result.spaceId) {
		return {
			data: null,
			success: false,
			message: 'Ocorreu um erro ao criar o space, tente novamente mais tarde.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: result.spaceId })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	revalidatePath('/space')

	return {
		data: result.spaceId,
		success: true,
	}
}

export const createSpaceAction = cache(handler)
