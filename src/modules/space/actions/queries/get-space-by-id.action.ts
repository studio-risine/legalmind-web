'use server'

import type { Space } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { makeSpaceRepository } from '@modules/space/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input {
	id: string
}

export interface Output {
	data: Space | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inputSchema = z.object({
	id: z.uuid('Invalid space id'),
})

const outputSchema = z.object({
	data: z.custom<Space>().nullable(),
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
			message: 'User not authenticated',
		}
	}

	const spaceRepository = makeSpaceRepository()
	const space = await spaceRepository.findById({ id: inputParsed.data.id })

	if (!space) {
		return {
			data: null,
			success: false,
			message: 'Space não encontrado.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: space })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	return {
		data: space,
		success: true,
	}
}

export const getSpaceByIdAction = cache(handler)
