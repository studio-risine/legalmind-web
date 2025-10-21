'use server'

import { db } from '@infra/db'
import { type Process, processes } from '@infra/db/schemas/processes'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, eq, isNull } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const getProcessByIdInput = z.object({ id: z.string().min(1) })

export async function getProcessByIdAction(
	input: z.infer<typeof getProcessByIdInput>,
): Promise<Process | null> {
	const { id } = getProcessByIdInput.parse(input)

	const accountId = await getCurrentAccountId()

	if (!accountId) {
		return null
	}

	const [row] = await db
		.select()
		.from(processes)
		.where(
			and(
				eq(processes.id, id),
				eq(processes.account_id, accountId),
				isNull(processes.deleted_at),
			),
		)
		.limit(1)

	if (!row) return null

	const processSelectSchema = createSelectSchema(processes)
	return processSelectSchema.parse(row)
}
