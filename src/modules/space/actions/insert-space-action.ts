'use server'

import { db } from '@infra/db'
import { type Space, spaces, spacesToAccounts } from '@infra/db/schemas/spaces'
import { createValidatedActionWithOutput } from '@libs/zod'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { revalidatePath } from 'next/cache'
import type { z } from 'zod'

const inputSchema = createInsertSchema(spaces).pick({
	name: true,
	type: true,
	createdBy: true,
}).required({ name: true, createdBy: true })

const outputSchema = createSelectSchema(spaces)

export type InsertSpaceInput = z.input<typeof inputSchema>

const handleAction = async ({
	name,
	type = 'INDIVIDUAL',
	createdBy,
}: InsertSpaceInput): Promise<Space> => {
	// Insert space
	const [newSpace] = await db
		.insert(spaces)
		.values({
			name,
			type,
			createdBy,
		})
		.returning()

	if (!newSpace) {
		throw new Error('Failed to create space')
	}

	// Associate the creator with the space
	await db
		.insert(spacesToAccounts)
		.values({
			spaceId: newSpace.id,
			accountId: createdBy,
		})

	revalidatePath('/onboarding')
	revalidatePath('/dashboard')

	return newSpace
}

export const insertSpaceAction = createValidatedActionWithOutput(
	inputSchema,
	outputSchema,
)(handleAction)