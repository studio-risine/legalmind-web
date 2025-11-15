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
	description: z.string().optional(),
	name: z
		.string()
		.min(2, 'O nome do space é obrigatório e deve ter ao menos 2 caracteres')
		.max(100),
	type: z.enum(['INDIVIDUAL', 'FIRM', 'DEPARTMENT']),
})

const outputSchema = z.object({
	data: z.string(),
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
			message: 'Você não tem permissão para criar um space com esta conta.',
			success: false,
		}
	}

	const spaceRepository = makeSpaceRepository()

	const result = await spaceRepository.insert({
		createdBy: input.accountId,
		name: input.name,
		type: input.type,
	})

	if (!result.spaceId) {
		return {
			data: null,
			message: 'Ocorreu um erro ao criar o space, tente novamente mais tarde.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: result.spaceId,
	})

	if (!outputParsed.success) {
		return {
			data: null,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
			success: false,
		}
	}

	revalidatePath('/space')

	return {
		data: result.spaceId,
		success: true,
	}
}

export const createSpaceAction = cache(handler)
