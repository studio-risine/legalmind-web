'use server'

import { db } from '@infra/db'
import { type Process, processes } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const processInsertSchema = createInsertSchema(processes, {
	tags: z.array(z.string()),
}).pick({
	title: true,
	cnj: true,
	court: true,
	client_id: true,
	space_id: true,
	tags: true,
})

export type ProcessInsertInput = z.infer<typeof processInsertSchema>

export interface InsertProcessOutput {
	success: boolean
	data?: Process
	error?: string
}

export async function insertProcessAction(
	input: ProcessInsertInput,
): Promise<InsertProcessOutput> {
	const parsed = processInsertSchema.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return {
				success: false,
				error: 'No account found to associate process.',
			}
		}

		// Verify that space_id is provided
		if (!parsed.data.space_id) {
			return { success: false, error: 'space_id is required' }
		}

		// Verify if the account is a member of the space
		const [membership] = await db
			.select()
			.from(spacesToAccounts)
			.where(
				and(
					eq(spacesToAccounts.spaceId, parsed.data.space_id),
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

		const [row] = await db.insert(processes).values(parsed.data).returning()

		if (!row) {
			return { success: false, error: 'Failed to create process' }
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
