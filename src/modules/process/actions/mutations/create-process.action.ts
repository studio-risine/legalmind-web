'use server'

import type { InsertProcess } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input
	extends Pick<
		InsertProcess,
		| 'spaceId'
		| 'clientId'
		| 'title'
		| 'description'
		| 'processNumber'
		| 'status'
		| 'assignedId'
		| 'createdBy'
	> {}

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
	clientId: z.string().uuid('Cliente inválido'),
	title: z.string().min(3, 'Título deve ter ao menos 3 caracteres').max(255),
	description: z.string().optional(),
	processNumber: z
		.string()
		.min(20, 'Número do processo deve ter 20 caracteres')
		.max(25),
	status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'CLOSED']),
	assignedId: z.string().uuid('Responsável inválido'),
	createdBy: z.string().uuid('Criador inválido'),
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
	const result = await processRepository.insert(inputParsed.data)

	if (!result.processId) {
		return {
			data: null,
			success: false,
			message: 'Ocorreu um erro ao criar o processo, tente novamente.',
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
		message: 'Processo criado com sucesso!',
	}
}

export const createProcessAction = cache(handler)
