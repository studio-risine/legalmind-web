'use server'

import {
	type Process,
	processSchema,
	processStatusSchema,
} from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { userAuthAction } from '@modules/auth/actions'
import { getProcessRepository } from '@modules/process/factories'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

const inputSchema = z.object({
	spaceId: z.string().min(1, 'Space ID é obrigatório'),
	page: z.number().optional().default(1),
	pageSize: z.number().min(1).max(100).default(10).optional(),
	searchQuery: z.string().optional(),
	sortBy: z.enum(['createdAt']).optional(),
	sortDirection: z.enum(['asc', 'desc']).optional(),
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

	const processRepository = getProcessRepository()
	const processes = await processRepository.findMany({
		spaceId: inputParsed.data.spaceId,
		page: inputParsed.data.page,
		pageSize: inputParsed.data.pageSize,
		searchQuery: inputParsed.data.searchQuery,
		sortBy: inputParsed.data.sortBy,
		sortDirection: inputParsed.data.sortDirection,
		status: inputParsed.data.status,
	})

	const {
		data: outputData,
		success: outputSuccess,
		error: outputError,
	} = outputSchema.safeParse(processes)

	if (!outputSuccess) {
		return {
			data: null,
			success: false,
			error: outputError,
			message: formatZodError(outputError),
		}
	}

	return {
		success: true,
		data: {
			rows: outputData.data,
			total: outputData.total,
		},
	}
}

export const queryProcesses = cache(handler)
export const queryProcessesWithoutCacheAction = handler
