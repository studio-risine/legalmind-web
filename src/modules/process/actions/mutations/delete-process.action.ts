'use server'

import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getProcessRepository } from '@modules/process/factories'
import { getSpaceIdFromHeaders } from '@modules/space/http/get-space-id-headers'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
}

export interface Output {
	data: null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	id: z.uuid('Invalid process id'),
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

	const spaceId = await getSpaceIdFromHeaders()

	if (!spaceId) {
		return {
			data: null,
			message: 'Space ID não encontrado nos headers',
			success: false,
		}
	}

	const processRepository = getProcessRepository()
	await processRepository.delete({
		id: inputParsed.data.id,
		spaceId,
	})

	revalidatePath(`/space/${spaceId}/processos`)

	return {
		data: null,
		message: 'Processo excluído com sucesso!',
		success: true,
	}
}

export const deleteProcessAction = cache(handler)
