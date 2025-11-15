'use server'

import type { Deadline } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getDeadlineRepository } from '@modules/deadline/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	spaceId: string
	limit?: number
	offset?: number
	search?: string
	status?: 'OPEN' | 'DONE' | 'CANCELED'
	priority?: 'LOW' | 'MEDIUM' | 'HIGH'
	processId?: string
	dueDateFrom?: Date
	dueDateTo?: Date
}

export interface Output {
	data: {
		deadlines: Deadline[]
		total: number
	} | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	dueDateFrom: z.date().optional(),
	dueDateTo: z.date().optional(),
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
	processId: z.string().uuid().optional(),
	search: z.string().optional(),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
	status: z.enum(['OPEN', 'DONE', 'CANCELED']).optional(),
})

const outputSchema = z.object({
	data: z.object({
		deadlines: z.array(z.custom<Deadline>()),
		total: z.number(),
	}),
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
			message: 'Usuário não autenticado',
			success: false,
		}
	}

	const deadlineRepository = getDeadlineRepository()
	const result = await deadlineRepository.list(inputParsed.data)

	const outputParsed = outputSchema.safeParse({
		data: result,
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
		data: result,
		success: true,
	}
}

export const listDeadlinesAction = cache(handler)
