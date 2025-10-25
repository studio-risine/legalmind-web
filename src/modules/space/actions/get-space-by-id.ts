'use server'

import { ResourceNotFoundError } from '@errors/resource-not-found-error'
import { db } from '@infra/db'
import { spaces } from '@infra/db/schemas'
import type { Space } from '@infra/db/schemas/spaces'
import { createValidatedActionWithOutput } from '@libs/zod'
import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import z from 'zod'

const inputSchema = z.object({
	spaceId: z.uuid(),
})

const outputSchema = createSelectSchema(spaces)

export type GetSpaceByIdInput = z.input<typeof inputSchema>

const handleAction = async ({ spaceId }: GetSpaceByIdInput): Promise<Space> => {
	const space = await db
		.select()
		.from(spaces)
		.where(eq(spaces.id, spaceId))
		.limit(1)
		.then((result) => result[0])

	if (!space) {
		throw new ResourceNotFoundError('Space')
	}

	return space
}

export const getSpaceByIdAction = createValidatedActionWithOutput(
	inputSchema,
	outputSchema,
)(handleAction)
