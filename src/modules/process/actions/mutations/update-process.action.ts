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
	id: z.string().uuid('Invalid process id'),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
	data: z.object({
		clientId: z.string().uuid().optional(),
		title: z.string().min(3).max(255).optional(),
		description: z.string().optional(),
		processNumber: z.string().min(20).max(25).optional(),
		status: z
			.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'CLOSED'])
			.optional(),
		assignedId: z.string().uuid().optional(),
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

	const processRepository = getProcessRepository()
	const result = await processRepository.update({
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
		data: inputParsed.data.data,
	})

	if (!result.processId) {
		return {
			data: null,
			success: false,
			message: 'Ocorreu um erro ao atualizar o processo, tente novamente.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: result.processId })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	revalidatePath(`/space/${input.spaceId}/processos`)

	return {
		data: result.processId,
		success: true,
		message: 'Processo atualizado com sucesso!',
	}
}

export const updateProcessAction = cache(handler)
