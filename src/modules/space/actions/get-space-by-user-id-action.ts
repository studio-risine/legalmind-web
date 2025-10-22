'use server'

import { db } from '@infra/db'
import { type Process, processes } from '@infra/db/schemas/processes'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq, isNull } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const getSpaceByUserInput = z.object({ id: z.uuidv7() })

export async function getSpaceByUserAction(
	input: z.infer<typeof getSpaceByUserInput>,
): Promise<Space | null> {
	const { id } = getSpaceByUserInput.parse(input)

	// User Already?
	// Space's are always linked to an account

	if (!accountId) {
		return null
	}

	// const [row] = await db
	// 	.select()
	// 	.from(processes)
	// 	.where(
	// 		and(
	// 			eq(processes.id, id),
	// 			eq(processes.account_id, accountId),
	// 			isNull(processes.deleted_at),
	// 		),
	// 	)
	// 	.limit(1)

	// if (!row) return null

	// const processSelectSchema = createSelectSchema(processes)
	// return processSelectSchema.parse(row)
}
