'use server'

import { db } from '@infra/db'
import type { InsertProcess } from '@infra/db/schemas/core'
import { processes } from '@infra/db/schemas/core'
import { formatZodError } from '@libs/zod/error-handlers'
import { csvProcessRowSchema } from '@libs/zod/process'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { createAuditLog } from '@modules/process/audit'
import type { AuthError } from '@supabase/supabase-js'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import z, { type ZodError } from 'zod'

const importCSVSchema = z.object({
	clientId: z.uuid(),
	rows: z.array(csvProcessRowSchema).min(1).max(5000), // Max 5k rows per import
	spaceId: z.string().min(1),
})

type ImportCSVInput = z.infer<typeof importCSVSchema>

export interface ImportCSVOutput {
	data: {
		success: number
		failed: number
		errors: Array<{ row: number; error: string }>
	} | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

/**
 * Imports multiple processes from CSV data
 * Validates each row and creates process records in bulk
 * Returns summary of success/failures
 */
async function importCSVHandler(input: ImportCSVInput): Promise<ImportCSVOutput> {
	const inputParsed = importCSVSchema.safeParse(input)

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
		const results = {
			errors: [] as Array<{ row: number; error: string }>,
			failed: 0,
			success: 0,
		}

		// Process rows in batches to avoid overwhelming database
		const batchSize = 100
		const batches = Math.ceil(inputParsed.data.rows.length / batchSize)

		for (let i = 0; i < batches; i++) {
			const start = i * batchSize
			const end = Math.min(start + batchSize, inputParsed.data.rows.length)
			const batch = inputParsed.data.rows.slice(start, end)

			const processesToInsert: InsertProcess[] = []

			for (let j = 0; j < batch.length; j++) {
				const rowIndex = start + j + 1
				const row = batch[j]

				try {
					// Check for duplicate process number in current space
					const existingProcessRecord = await db
						.select({ id: processes._id })
						.from(processes)
						.where(
							and(
								eq(processes.processNumber, row.numero_processo_cnj),
								eq(processes.spaceId, inputParsed.data.spaceId),
							),
						)
						.limit(1)

					if (existingProcessRecord.length > 0) {
						results.failed++
						results.errors.push({
							error: `Process ${row.numero_processo_cnj} already exists`,
							row: rowIndex,
						})
						continue
					}

					processesToInsert.push({
						assignedId: accountId,
						clientId: inputParsed.data.clientId,
						court: row.vara,
						courtClass: row.classe,
						createdBy: accountId,
						description: row.parte_principal ? `Main party: ${row.parte_principal}` : undefined,
						partiesSummary: row.parte_principal,
						phase: undefined,
						processNumber: row.numero_processo_cnj,
						spaceId: inputParsed.data.spaceId,
						status: 'ACTIVE',
						title: `Process ${row.numero_processo_cnj}`,
					})
				} catch (rowError) {
					results.failed++
					results.errors.push({
						error: rowError instanceof Error ? rowError.message : 'Unknown error',
						row: rowIndex,
					})
				}
			}

			// Bulk insert batch
			if (processesToInsert.length > 0) {
				try {
					const inserted = await db
						.insert(processes)
						.values(processesToInsert)
						.returning({ id: processes._id })
					results.success += inserted.length

					await createAuditLog({
						action: 'CREATE',
						actorId: accountId,
						entity: 'PROCESS',
						entityId: inputParsed.data.spaceId, // Use space ID as entity ID for bulk import
						spaceId: inputParsed.data.spaceId,
						summary: `Imported ${inserted.length} processes from CSV (batch ${i + 1}/${batches})`,
					})
				} catch (batchError) {
					// Mark all rows in failed batch
					for (let counter = 0; counter < processesToInsert.length; counter++) {
						results.failed++
						results.errors.push({
							error: batchError instanceof Error ? batchError.message : 'Batch insert failed',
							row: start + counter + 1,
						})
					}
				}
			}
		}

		revalidatePath('/process')

		return {
			data: results,
			message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
			success: true,
		}
	} catch (error) {
		console.error('Error in importCSVAction:', error)

		return {
			data: null,
			message: error instanceof Error ? error.message : 'An error occurred while importing CSV',
			success: false,
		}
	}
}

export const importCSVAction = importCSVHandler
