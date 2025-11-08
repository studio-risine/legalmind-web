'use server'

import { processStatusSchema } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import {
	processNumberSchema,
	spaceIdSchemaDefault,
} from '@libs/zod/schemas/defaults'
import { makeAccountRepository } from '@modules/account'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { clientIdSchema } from '@modules/client/schemas'
import { makeProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

const inputSchema = z.object({
	spaceId: spaceIdSchemaDefault,
	clientId: clientIdSchema,
	title: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(255),
	description: z.string().optional(),
	processNumber: processNumberSchema,
	status: processStatusSchema.default('ACTIVE'),
})

const outputSchema = z.object({
	data: z.uuid(),
})

type Input = z.infer<typeof inputSchema>

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

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

	try {
		const account = makeAccountRepository()
		const accountExists = await account.findByUserId(user.id)

		if (!accountExists) {
			return {
				data: null,
				success: false,
				message: 'Conta do usuário não encontrada.',
			}
		}

		const process = makeProcessRepository()
		const result = await process.insert({
			...inputParsed.data,
			createdBy: accountExists.id,
			assignedId: accountExists.id,
		})

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
	} catch (error) {
		console.error('Error in insertProcessAction:', error)

		return {
			data: null,
			success: false,
			message:
				error instanceof Error
					? error.message
					: 'Ocorreu um erro ao criar o processo, tente novamente.',
		}
	}
}

export const insertProcessAction = cache(handler)
export const insertProcessWithoutCacheAction = handler
