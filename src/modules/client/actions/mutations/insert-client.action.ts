'use server'

import {
	clientStatusSchema,
	clientTypesSchema,
	type InsertClient,
} from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import {
	emailSchemaDefault,
	nameSchemaDefault,
	spaceIdSchemaDefault,
} from '@libs/zod/schemas/defaults'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { clientRepository } from '@modules/client/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input
	extends Pick<
		InsertClient,
		| 'spaceId'
		| 'name'
		| 'email'
		| 'phoneNumber'
		| 'type'
		| 'documentNumber'
		| 'status'
	> {}

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	documentNumber: z.string().min(11, 'CPF/CNPJ inválido').max(18),
	email: emailSchemaDefault,
	name: nameSchemaDefault,
	phoneNumber: z.string().optional(),
	spaceId: spaceIdSchemaDefault,
	status: clientStatusSchema,
	type: clientTypesSchema,
})

const outputSchema = z.object({
	data: z.uuid(),
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
	const result = await repository.insert(inputParsed.data)

	if (!result.clientId) {
		return {
			data: null,
			message: 'Ocorreu um erro ao criar o cliente, tente novamente.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: result.clientId,
	})

	if (!outputParsed.success) {
		return {
			data: null,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
			success: false,
		}
	}

	revalidatePath(`/space/${input.spaceId}/clientes`)

	return {
		data: result.clientId,
		message: 'Cliente criado com sucesso!',
		success: true,
	}
}

export const inserClientAction = cache(handler)
export const insertClientWithoutCacheAction = handler
