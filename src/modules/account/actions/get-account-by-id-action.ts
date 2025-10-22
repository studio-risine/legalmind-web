'use server'

import { db } from '@infra/db'
import { type Account, accounts } from '@infra/db/schemas/accounts'
import { and, eq, isNull } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const getAccountByIdSchema = z.object({
	id: z.string().min(1),
})

export type GetAccountByIdInput = z.infer<typeof getAccountByIdSchema>

export interface GetAccountByIdOutput {
	success: boolean
	data?: Account
	error?: string
}

export async function getAccountByIdAction(
	input: GetAccountByIdInput,
): Promise<GetAccountByIdOutput> {
	const parsed = getAccountByIdSchema.safeParse(input)

	if (!parsed.success) {
		return {
			success: false,
			error: parsed.error.issues
				.map((e) => `${e.path.join('.')}: ${e.message}`)
				.join(', '),
		}
	}

	try {
		const { id } = parsed.data

		// Get account if it exists and is not deleted
		const [row] = await db
			.select()
			.from(accounts)
			.where(and(eq(accounts.id, id), isNull(accounts.deleted_at)))
			.limit(1)

		if (!row) {
			return {
				success: false,
				error: 'Account not found.',
			}
		}

		const accountSelectSchema = createSelectSchema(accounts)
		const account = accountSelectSchema.parse(row)

		return {
			success: true,
			data: account,
		}
	} catch (error) {
		console.error('Failed to get account:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred.',
		}
	}
}
