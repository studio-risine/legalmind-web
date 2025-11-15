'use server'

import { type Process, processSchema } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { getProcessRepository } from '@modules/process/factories'
import { getSpaceIdFromHeaders } from '@modules/space/http/get-space-id-headers'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

const inputSchema = z.object({
	id: z.string('Invalid process id'),
})

const outputSchema = z.object({
	data: processSchema,
})

type Input = z.input<typeof inputSchema>

interface Output {
	data: Process | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

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
			error,
			message: 'Usuário não autenticado',
			success: false,
		}
	}

	const spaceId = await getSpaceIdFromHeaders()

	if (!spaceId) {
		return {
			data: null,
			message: 'Resource not found',
			success: false,
		}
	}

	const repository = getProcessRepository()
	const process = await repository.findById({
		id: inputParsed.data.id,
		spaceId,
	})

	if (!process) {
		return {
			data: null,
			error: null,
			message: 'Resource not found',
			success: false,
		}
	}

	const {
		data: outputParsedData,
		success: outputParsedSuccess,
		error: outputParsedError,
	} = outputSchema.safeParse(process)

	if (!outputParsedSuccess) {
		return {
			data: null,
			error: outputParsedError,
			message: formatZodError(outputParsedError),
			success: false,
		}
	}

	return {
		data: outputParsedData.data,
		success: true,
	}
}

export const queryProcessById = cache(handler)
export const queryProcessByIdWithoutCacheAction = handler
