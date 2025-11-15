'use server'

import { processStatusSchema } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { processNumberSchema, spaceIdSchemaDefault } from '@libs/zod/schemas/defaults'
import { makeAccountRepository } from '@modules/account'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { clientIdSchema } from '@modules/client/schemas'
import { makeProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

const inputSchema = z.object({
	clientId: clientIdSchema,
	description: z.string().optional(),
	processNumber: processNumberSchema,
	spaceId: spaceIdSchemaDefault,
	status: processStatusSchema.default('ACTIVE'),
	title: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(255),
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

	try {
		const account = makeAccountRepository()
		const accountExists = await account.findByUserId(user.id)

		if (!accountExists) {
			return {
				data: null,
				message: 'Conta do usuário não encontrada.',
				success: false,
			}
		}

		const process = makeProcessRepository()
		const result = await process.insert({
			...inputParsed.data,
			assignedId: accountExists._id,
			createdBy: accountExists._id,
		})

		const outputParsed = outputSchema.safeParse({ data: result.processId })
		if (!outputParsed.success) {
			return {
				data: null,
				error: outputParsed.error,
				message: formatZodError(outputParsed.error),
				success: false,
			}
		}

		revalidatePath(`/space/${input.spaceId}/processos`)

		return {
			data: result.processId,
			message: 'Processo criado com sucesso!',
			success: true,
		}
	} catch (error) {
		console.error('Error in insertProcessAction:', error)

		return {
			data: null,
			message:
				error instanceof Error
					? error.message
					: 'Ocorreu um erro ao criar o processo, tente novamente.',
			success: false,
		}
	}
}

export const insertProcessAction = cache(handler)
export const insertProcessWithoutCacheAction = handler
