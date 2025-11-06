'use server'

import type { Process } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	spaceId: string
	limit?: number
	offset?: number
	search?: string
	status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'CLOSED'
	clientId?: string
	assignedId?: string
}

export interface Output {
	data: {
		processes: Process[]
		total: number
	} | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
	search: z.string().optional(),
	status: z
		.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'CLOSED'])
		.optional(),
	clientId: z.string().uuid().optional(),
	assignedId: z.string().uuid().optional(),
})

const outputSchema = z.object({
	data: z.object({
		processes: z.array(z.custom<Process>()),
		total: z.number(),
	}),
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
	const result = await processRepository.list(inputParsed.data)

	const outputParsed = outputSchema.safeParse({ data: result })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	return {
		data: result,
		success: true,
	}
}

export const listProcessesAction = cache(handler)
