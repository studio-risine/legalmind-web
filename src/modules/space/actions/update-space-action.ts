'use server'

import { db } from '@infra/db'
import { type Space, spaces, spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq } from 'drizzle-orm'
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const spaceUpdateDataSchema = createUpdateSchema(spaces).pick({
	name: true,
})

const spaceUpdateSchema = z
	.object({ id: z.string().min(1) })
	.merge(spaceUpdateDataSchema)

export type SpaceUpdateInput = z.infer<typeof spaceUpdateSchema>

export interface UpdateSpaceOutput {
	success: boolean
	data?: Space
	error?: string
}

export async function updateSpaceAction(
	input: SpaceUpdateInput,
): Promise<UpdateSpaceOutput> {
	const parsed = spaceUpdateSchema.safeParse(input)

	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const accountId = await getCurrentAccountId()

		if (!accountId) {
			return { success: false, error: 'No account found.' }
		}

		const { id, ...updateData } = parsed.data

		const spaceExists = await db
			.select({ id: spaces.id })
			.from(spaces)
			.innerJoin(spacesToAccounts, eq(spaces.id, spacesToAccounts.spaceId))
			.where(and(eq(spaces.id, id), eq(spacesToAccounts.accountId, accountId)))
			.limit(1)

		if (!spaceExists.length) {
			return { success: false, error: 'Space not found or access denied.' }
		}

		const [updatedSpace] = await db
			.update(spaces)
			.set({ ...updateData, updated_at: new Date() })
			.where(eq(spaces.id, id))
			.returning()

		if (!updatedSpace) {
			return { success: false, error: 'Failed to update space.' }
		}

		const spaceSelectSchema = createSelectSchema(spaces)
		const validatedSpace = spaceSelectSchema.parse(updatedSpace)

		revalidatePath('/dashboard')

		return { success: true, data: validatedSpace }
	} catch (error) {
		console.error('Failed to update space:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to update space',
		}
	}
}
