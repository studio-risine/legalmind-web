'use server'

import { db } from '@infra/db'
import { type Process, processes } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq } from 'drizzle-orm'
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const processUpdateDataSchema = createUpdateSchema(processes, {
	tags: z.array(z.string()).optional(),
}).pick({
	title: true,
	cnj: true,
	court: true,
	client_id: true,
	tags: true,
	status: true,
})

const processUpdateSchema = z
	.object({ id: z.string().min(1) })
	.merge(processUpdateDataSchema)

export type ProcessUpdateInput = z.infer<typeof processUpdateSchema>

export interface UpdateProcessOutput {
	success: boolean
	data?: Process
	error?: string
}

export async function updateProcessAction(
	input: ProcessUpdateInput,
): Promise<UpdateProcessOutput> {
	const parsed = processUpdateSchema.safeParse(input)
	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { success: false, error: 'No account found' }
		}

		const { id, ...updateData } = parsed.data

		// First, get the process to check its space_id
		const [existingProcess] = await db
			.select({ space_id: processes.space_id })
			.from(processes)
			.where(eq(processes.id, id))
			.limit(1)

		if (!existingProcess) {
			return { success: false, error: 'Process not found' }
		}

		// Verify if the account is a member of the space
		const [membership] = await db
			.select()
			.from(spacesToAccounts)
			.where(
				and(
					eq(spacesToAccounts.spaceId, existingProcess.space_id),
					eq(spacesToAccounts.accountId, accountId),
				),
			)
			.limit(1)

		if (!membership) {
			return {
				success: false,
				error: 'Access denied: not a member of this space',
			}
		}

		const [row] = await db
			.update(processes)
			.set({ ...updateData, updated_at: new Date() })
			.where(eq(processes.id, id))
			.returning()

		if (!row) {
			return { success: false, error: 'Process not found or access denied' }
		}

		const processSelectSchema = createSelectSchema(processes)
		const data = processSelectSchema.parse(row)

		revalidatePath('/dashboard/processes')

		return { success: true, data }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
