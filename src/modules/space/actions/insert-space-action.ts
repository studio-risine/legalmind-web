'use server'

import { db } from '@infra/db'
import { type Space, spaces, spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

const spaceInsertSchema = createInsertSchema(spaces)
	.pick({
		name: true,
	})
	.refine((data) => data.name && data.name.trim().length > 0, {
		message: 'Name cannot be empty',
		path: ['name'],
	})

export type SpaceInsertInput = z.infer<typeof spaceInsertSchema>

export interface InsertSpaceOutput {
	success: boolean
	data?: Space
	error?: string
}

export async function insertSpaceAction(
	input: SpaceInsertInput,
): Promise<InsertSpaceOutput> {
	const parsed = spaceInsertSchema.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { success: false, error: 'No account found to associate space.' }
		}

		// Create space and associate with account in a transaction
		const result = await db.transaction(async (tx) => {
			// Insert space
			const [space] = await tx.insert(spaces).values(parsed.data).returning()

			if (!space) {
				throw new Error('Failed to create space')
			}

			// Associate space with current account
			await tx.insert(spacesToAccounts).values({
				spaceId: space.id,
				accountId: accountId,
			})

			return space
		})

		const spaceSelectSchema = createSelectSchema(spaces)
		const validatedSpace = spaceSelectSchema.parse(result)

		revalidatePath('/dashboard')
		return { success: true, data: validatedSpace }
	} catch (error) {
		console.error('Failed to create space:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create space',
		}
	}
}
