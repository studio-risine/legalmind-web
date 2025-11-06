'use server'

import type { Deadline } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getDeadlineRepository } from '@modules/deadline/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
	spaceId: string
}

export interface Output {
	data: Deadline | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	id: z.string().uuid('Invalid deadline id'),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
})

const outputSchema = z.object({
	data: z.custom<Deadline>().nullable(),
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

	if (!user?.id) {
		return {
			data: null,
			success: false,
			error: error,
			message: 'Usuário não autenticado',
		}
	}

	const deadlineRepository = getDeadlineRepository()
	const deadline = await deadlineRepository.findById({
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
	})

	if (!deadline) {
		return {
			data: null,
			success: false,
			message: 'Prazo não encontrado.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: deadline })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	return {
		data: deadline,
		success: true,
	}
}

export const getDeadlineByIdAction = cache(handler)
