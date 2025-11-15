'use server'

import { db } from '@infra/db'
import type { InsertProcess } from '@infra/db/schemas/core'
import { processes } from '@infra/db/schemas/core'
import { formatZodError } from '@libs/zod/error-handlers'
import { processNumberSchema } from '@libs/zod/process'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { AuditSummary, createAuditLog } from '@modules/process/audit'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

const createProcessSchema = z.object({
	clientId: z.string().uuid('Invalid client ID'),
	court: z.string().optional(), // Court/vara
	courtClass: z.string().optional(), // Legal classification
	description: z.string().optional(),
	// Additional metadata for centralized legal process
	partiesSummary: z.string().optional(), // Summary of parties involved
	phase: z.string().optional(), // Current phase
	processNumber: processNumberSchema,
	spaceId: z.string().min(1, 'Space ID is required'),
	status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'CLOSED']).default('ACTIVE'),
	title: z.string().min(2, 'Title must be at least 2 characters').max(255),
})

type CreateProcessInput = z.infer<typeof createProcessSchema>

export interface CreateProcessOutput {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

/**
 * Creates a new process with CNJ validation and metadata
 * Records audit log for traceability
 */
async function createProcessHandler(input: CreateProcessInput): Promise<CreateProcessOutput> {
	const inputParsed = createProcessSchema.safeParse(input)

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
			message: 'User not authenticated',
			success: false,
		}
	}

	try {
		// Get user account ID from auth metadata
		// TODO: Replace with actual account lookup from Supabase Auth user metadata
		const accountId = user.id

		const newProcess: InsertProcess = {
			assignedId: accountId,
			clientId: inputParsed.data.clientId,
			court: inputParsed.data.court,
			courtClass: inputParsed.data.courtClass,
			createdBy: accountId,
			description: inputParsed.data.description,
			partiesSummary: inputParsed.data.partiesSummary,
			phase: inputParsed.data.phase,
			processNumber: inputParsed.data.processNumber,
			spaceId: inputParsed.data.spaceId,
			status: inputParsed.data.status,
			title: inputParsed.data.title,
		}

		const [result] = await db.insert(processes).values(newProcess).returning({ id: processes._id })

		if (!result?.id) {
			throw new Error('Failed to create process')
		}

		await createAuditLog({
			action: 'CREATE',
			actorId: accountId,
			entity: 'PROCESS',
			entityId: result.id,
			spaceId: inputParsed.data.spaceId,
			summary: AuditSummary.processCreated(inputParsed.data.processNumber),
		})

		revalidatePath(`/space/${input.spaceId}/process`)
		revalidatePath('/process')

		return {
			data: result.id,
			message: 'Process created successfully',
			success: true,
		}
	} catch (error) {
		console.error('Error in createProcessAction:', error)

		return {
			data: null,
			message:
				error instanceof Error ? error.message : 'An error occurred while creating the process',
			success: false,
		}
	}
}

export const createProcessAction = cache(createProcessHandler)
export const createProcessWithoutCache = createProcessHandler
