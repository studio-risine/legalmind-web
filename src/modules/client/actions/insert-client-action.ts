'use server'

import { db } from '@infra/db'
import { type Client, clients } from '@infra/db/schemas/clients'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

const clientInsertSchema = createInsertSchema(clients).pick({
	name: true,
	email: true,
	phone: true,
	tax_id: true,
})

export type ClientInsertInput = z.infer<typeof clientInsertSchema>

export interface InsertClientOutput {
	success: boolean
	data?: Client
	error?: string
}

export async function insertClientAction(
	input: ClientInsertInput,
): Promise<InsertClientOutput> {
	const parsed = clientInsertSchema.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { success: false, error: 'No account found to associate client.' }
		}

		const [row] = await db
			.insert(clients)
			.values({ ...parsed.data, account_id: accountId })
			.returning()

		if (!row) {
			return { success: false, error: 'Failed to create client' }
		}

		const clientSelectSchema = createSelectSchema(clients)
		const data = clientSelectSchema.parse(row)

		revalidatePath('/dashboard/clients')

		return { success: true, data }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
