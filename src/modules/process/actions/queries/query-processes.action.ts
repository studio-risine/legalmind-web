'use server'

import { type Process, processSchema, processStatusSchema } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions'
import { getProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

const inputSchema = z.object({
	page: z.number().optional().default(1),
	pageSize: z.number().min(1).max(100).default(10).optional(),
	searchQuery: z.string().optional(),
	sortBy: z.enum(['createdAt']).optional(),
	sortDirection: z.enum(['asc', 'desc']).optional(),
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
	status: processStatusSchema.optional(),
})

const outputSchema = z.object({
	data: z.array(processSchema),
	total: z.number(),
})

type Input = z.input<typeof inputSchema>

export interface Output {
	data: {
		rows: Process[]
		total: number
	} | null
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

	const repository = getProcessRepository()
	const processes = await repository.findMany({
		page: inputParsed.data.page,
		pageSize: inputParsed.data.pageSize,
		searchQuery: inputParsed.data.searchQuery,
		sortBy: inputParsed.data.sortBy,
		sortDirection: inputParsed.data.sortDirection,
		spaceId: inputParsed.data.spaceId,
		status: inputParsed.data.status,
	})

	if (!processes) {
		return {
			data: null,
			error: null,
			message: 'Resource not found',
			success: false,
		}
	}

	const {
		data: outputData,
		success: outputSuccess,
		error: outputError,
	} = outputSchema.safeParse(processes)

	if (!outputSuccess) {
		return {
			data: null,
			error: outputError,
			message: formatZodError(outputError),
			success: false,
		}
	}

	return {
		data: {
			rows: outputData.data,
			total: outputData.total,
		},
		success: true,
	}
}

export const queryProcesses = cache(handler)
export const queryProcessesWithoutCacheAction = handler
