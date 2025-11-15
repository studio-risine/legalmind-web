'use server'

import type { Client } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { idSchema, spaceIdSchemaDefault } from '@libs/zod/schemas/defaults'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { clientRepository } from '@modules/client/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
	spaceId: string
}

export interface Output {
	data: Client | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	id: idSchema,
	spaceId: spaceIdSchemaDefault,
})

const outputSchema = z.object({
	data: z.custom<Client>().nullable(),
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
	const client = await repository.findById({
		id: inputParsed.data.id,
		spaceId: inputParsed.data.spaceId,
	})

	if (!client) {
		return {
			data: null,
			message: 'Cliente não encontrado.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: client,
	})

	if (!outputParsed.success) {
		return {
			data: null,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
			success: false,
		}
	}

	const { data: resultParsed } = outputParsed

	return {
		data: resultParsed.data,
		success: true,
	}
}

export const queryClientByIdAction = cache(handler)
export const queryClientByIdWithoutCacheAction = handler
