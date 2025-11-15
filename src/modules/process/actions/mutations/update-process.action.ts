'use server'

import type { InsertProcess } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
	spaceId: string
	data: Partial<
		Pick<
			InsertProcess,
			| 'clientId'
			| 'title'
			| 'description'
			| 'processNumber'
			| 'status'
			| 'assignedId'
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
		assignedId: z.string().uuid().optional(),
		clientId: z.string().uuid().optional(),
		description: z.string().optional(),
		processNumber: z.string().min(20).max(25).optional(),
		status: z
			.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'CLOSED'])
			.optional(),
		title: z.string().min(3).max(255).optional(),
	}),
	id: z.string().uuid('Invalid process id'),
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

	const processRepository = getProcessRepository()
	const result = await processRepository.update({
		data: inputParsed.data.data,
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
	})

	if (!result.processId) {
		return {
			data: null,
			message: 'Ocorreu um erro ao atualizar o processo, tente novamente.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: result.processId,
	})

	if (!outputParsed.success) {
		return {
			data: null,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
			success: false,
		}
	}

	revalidatePath(`/space/${input.spaceId}/processos`)

	return {
		data: result.processId,
		message: 'Processo atualizado com sucesso!',
		success: true,
	}
}

export const updateProcessAction = cache(handler)
