'use server'

import type { InsertDeadline } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getDeadlineRepository } from '@modules/deadline/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input
	extends Pick<
		InsertDeadline,
		'spaceId' | 'processId' | 'dueDate' | 'status' | 'priority' | 'notes'
	> {}

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
	processId: z.string().uuid('Processo inválido'),
	dueDate: z.date(),
	status: z.enum(['OPEN', 'DONE', 'CANCELED']),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
	notes: z.string().optional(),
})

const outputSchema = z.object({
	data: z.string().uuid(),
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
	const result = await deadlineRepository.insert(inputParsed.data)

	if (!result.deadlineId) {
		return {
			data: null,
			success: false,
			message: 'Ocorreu um erro ao criar o prazo, tente novamente.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: result.deadlineId })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	revalidatePath(`/space/${input.spaceId}/prazos`)

	return {
		data: result.deadlineId,
		success: true,
		message: 'Prazo criado com sucesso!',
	}
}

export const createDeadlineAction = cache(handler)
