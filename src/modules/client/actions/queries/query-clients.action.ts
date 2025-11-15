'use server'

import {
	type Client,
	type ClientStatus,
	clientStatusSchema,
	clientTypesSchema,
} from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { spaceIdSchemaDefault } from '@libs/zod/schemas/defaults'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { clientRepository } from '@modules/client/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	spaceId: string
	limit?: number
	offset?: number
	search?: string
	status?: ClientStatus
	type?: ClientTypes
}

export interface Output {
	data: {
		clients: Client[]
		total: number
	} | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
	search: z.string().optional(),
	spaceId: spaceIdSchemaDefault,
	status: clientStatusSchema.optional(),
	type: clientTypesSchema.optional(),
})

const outputSchema = z.object({
	data: z.object({
		clients: z.array(z.custom<Client>()),
		total: z.number(),
	}),
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
	const result = await repository.findMany(inputParsed.data)

	const formattedResult = {
		clients: result.data,
		total: result.total,
	}

	const outputParsed = outputSchema.safeParse({ data: formattedResult })

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

export const queryClientsAction = cache(handler)
export const queryClientsWithoutCacheAction = handler
