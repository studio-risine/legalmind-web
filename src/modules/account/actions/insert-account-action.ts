'use server'

import { db } from '@infra/db'
import { type Account, accounts } from '@infra/db/schemas/accounts'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

const accountInsertSchema = createInsertSchema(accounts).pick({
	name: true,
	displayName: true,
	email: true,
})

export type AccountInsertInput = z.infer<typeof accountInsertSchema>

export interface InsertAccountOutput {
	success: boolean
	data?: Account
	error?: string
}

export async function insertAccountAction(
	input: AccountInsertInput,
): Promise<InsertAccountOutput> {
	const parsed = accountInsertSchema.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const [row] = await db.insert(accounts).values(parsed.data).returning()

		if (!row) {
			return { success: false, error: 'Failed to create account' }
		}

		const accountSelectSchema = createSelectSchema(accounts)
		const validatedAccount = accountSelectSchema.parse(row)

		revalidatePath('/dashboard')
		return { success: true, data: validatedAccount }
	} catch (error) {
		console.error('Failed to create account:', error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to create account',
		}
	}
}
