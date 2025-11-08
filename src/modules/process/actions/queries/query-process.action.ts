'use server'

import { type Process, processSchema } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

const inputSchema = z.object({
	id: z.string().uuid('Invalid process id'),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
})

const outputSchema = z.object({
	row: processSchema,
})

type Input = z.input<typeof inputSchema>

interface Output {
	data: { row: Process } | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

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
			error,
			message: 'Usuário não autenticado',
		}
	}

	const repo = getProcessRepository()
	const row = await repo.findById({
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
	})

	if (!row) {
		return {
			data: null,
			success: false,
			message: 'Processo não encontrado',
			error: null,
		}
	}

	const parsed = outputSchema.safeParse({ row })
	if (!parsed.success) {
		return {
			data: null,
			success: false,
			error: parsed.error,
			message: formatZodError(parsed.error),
		}
	}

	return {
		success: true,
		data: parsed.data,
	}
}

export const queryProcess = cache(handler)
export const queryProcessWithoutCacheAction = handler
