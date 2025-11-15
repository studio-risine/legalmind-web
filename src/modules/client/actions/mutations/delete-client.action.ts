'use server'

import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { clientRepository } from '@modules/client/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
	spaceId: string
}

export interface Output {
	data: null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	id: z.uuid('Cliente ID inválido'),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
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

	const repository = clientRepository()
	await repository.delete({
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
	})

	revalidatePath(`/space/${input.spaceId}/clientes`)

	return {
		data: null,
		message: 'Cliente excluído com sucesso!',
		success: true,
	}
}

export const deleteClientAction = cache(handler)
export const deleteClientWithoutCacheAction = handler
