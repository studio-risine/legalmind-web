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
	data: z.object({
		dueDate: z.date().optional(),
		notes: z.string().optional(),
		priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
		processId: z.string().uuid().optional(),
		status: z.enum(['OPEN', 'DONE', 'CANCELED']).optional(),
	}),
	id: z.string().uuid('Invalid deadline id'),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
})

const outputSchema = z.object({
	data: z.string().uuid(),
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
	const result = await deadlineRepository.update({
		data: inputParsed.data.data,
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
	})

	if (!result.deadlineId) {
		return {
			data: null,
			message: 'Ocorreu um erro ao atualizar o prazo, tente novamente.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: result.deadlineId,
	})

	if (!outputParsed.success) {
		return {
			data: null,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
			success: false,
		}
	}

	revalidatePath(`/space/${input.spaceId}/prazos`)

	return {
		data: result.deadlineId,
		message: 'Prazo atualizado com sucesso!',
		success: true,
	}
}

export const updateDeadlineAction = cache(handler)
