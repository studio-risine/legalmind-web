'use server'

import { db } from '@infra/db'
import { type Process, processes } from '@infra/db/schemas/processes'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
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
			return { success: false, error: 'No account found to associate process.' }
		}

		const [row] = await db
			.insert(processes)
			.values({ ...parsed.data, account_id: accountId })
			.returning()

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
