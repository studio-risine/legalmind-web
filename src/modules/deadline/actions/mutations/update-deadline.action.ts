'use server'

import type { InsertDeadline } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getDeadlineRepository } from '@modules/deadline/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
	spaceId: string
	data: Partial<
		Pick<
			InsertDeadline,
			'processId' | 'dueDate' | 'status' | 'priority' | 'notes'
		>
	>
}

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	id: z.string().uuid('Invalid deadline id'),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
	data: z.object({
		processId: z.string().uuid().optional(),
		dueDate: z.date().optional(),
		status: z.enum(['OPEN', 'DONE', 'CANCELED']).optional(),
		priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
		notes: z.string().optional(),
	}),
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
	const result = await deadlineRepository.update({
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
		data: inputParsed.data.data,
	})

	if (!result.deadlineId) {
		return {
			data: null,
			success: false,
			message: 'Ocorreu um erro ao atualizar o prazo, tente novamente.',
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
		message: 'Prazo atualizado com sucesso!',
	}
}

export const updateDeadlineAction = cache(handler)
