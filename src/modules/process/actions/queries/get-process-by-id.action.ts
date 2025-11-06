'use server'

import type { Process } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
	spaceId: string
}

export interface Output {
	data: Process | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	id: z.string().uuid('Invalid process id'),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
})

const outputSchema = z.object({
	data: z.custom<Process>().nullable(),
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

	const processRepository = getProcessRepository()
	const process = await processRepository.findById({
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
	})

	if (!process) {
		return {
			data: null,
			success: false,
			message: 'Processo não encontrado.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: process })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	return {
		data: process,
		success: true,
	}
}

export const getProcessByIdAction = cache(handler)
