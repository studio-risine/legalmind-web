'use server'

import { db } from '@infra/db'
import type { InsertProcess } from '@infra/db/schemas/core'
import { processes } from '@infra/db/schemas/core'
import { formatZodError } from '@libs/zod/error-handlers'
import { processNumberSchema } from '@libs/zod/process'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { createAuditLog } from '@modules/process/audit'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import z, { type ZodError } from 'zod'

const importByCNJSchema = z.object({
	clientId: z.string().uuid(),
	processNumber: processNumberSchema,
	spaceId: z.string().min(1),
})

type ImportByCNJInput = z.infer<typeof importByCNJSchema>

export interface ImportByCNJOutput {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

/**
 * Imports process by CNJ number
 * Fetches metadata from court system API and creates process record
 *
 * TODO: Integrate with tribunal-specific APIs (TJ-SP, TJ-RJ, etc.)
 * Current implementation: Validates CNJ and creates basic process
 */
async function importByCNJHandler(input: ImportByCNJInput): Promise<ImportByCNJOutput> {
	const inputParsed = importByCNJSchema.safeParse(input)

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
		const accountId = user.id

		// TODO: Fetch process metadata from CNJ/tribunal API
		// For now, create basic process with CNJ number
		const processMetadata = await fetchProcessFromCNJ(inputParsed.data.processNumber)

		const newProcess: InsertProcess = {
			assignedId: accountId,
			clientId: inputParsed.data.clientId,
			court: processMetadata.court,
			courtClass: processMetadata.courtClass,
			createdBy: accountId,
			description: processMetadata.description,
			partiesSummary: processMetadata.parties,
			phase: processMetadata.phase,
			processNumber: inputParsed.data.processNumber,
			spaceId: inputParsed.data.spaceId,
			status: 'ACTIVE',
			title: processMetadata.title || `Process ${inputParsed.data.processNumber}`,
		}

		const [result] = await db.insert(processes).values(newProcess).returning({ id: processes._id })

		if (!result?.id) {
			throw new Error('Failed to import process')
		}

		await createAuditLog({
			action: 'CREATE',
			actorId: accountId,
			entity: 'PROCESS',
			entityId: result.id,
			spaceId: inputParsed.data.spaceId,
			summary: `Process ${inputParsed.data.processNumber} imported from CNJ`,
		})

		revalidatePath('/process')

		return {
			data: result.id,
			message: 'Process imported successfully from CNJ',
			success: true,
		}
	} catch (error) {
		console.error('Error in importByCNJAction:', error)

		return {
			data: null,
			message:
				error instanceof Error ? error.message : 'An error occurred while importing the process',
			success: false,
		}
	}
}

/**
 * Fetches process metadata from CNJ/tribunal API
 * TODO: Implement actual API integration with tribunal-specific endpoints
 *
 * @param processNumber - CNJ formatted process number
 * @returns Process metadata
 */
async function fetchProcessFromCNJ(processNumber: string): Promise<{
	title?: string
	description?: string
	parties?: string
	courtClass?: string
	court?: string
	phase?: string
}> {
	// TODO: Implement actual CNJ API integration
	// Current stub returns empty metadata

	// Example implementation would:
	// 1. Extract tribunal code from CNJ number (positions 14-15)
	// 2. Call tribunal-specific API endpoint
	// 3. Parse and normalize response
	// 4. Handle fallback for unavailable tribunals

	console.warn('CNJ API integration not yet implemented for:', processNumber)

	return {
		court: undefined,
		courtClass: undefined,
		description: undefined,
		parties: undefined,
		phase: undefined,
		title: undefined,
	}
}

export const importByCNJAction = importByCNJHandler
