'use server'

import { db } from '@infra/db'
import { type Process, processes } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
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
		.where(and(eq(processes.id, id), isNull(processes.deleted_at)))
		.limit(1)

	if (!row) return null

	// Verify if the account is a member of the process's space
	const [membership] = await db
		.select()
		.from(spacesToAccounts)
		.where(
			and(
				eq(spacesToAccounts.spaceId, row.space_id),
				eq(spacesToAccounts.accountId, accountId),
			),
		)
		.limit(1)

	if (!membership) {
		return null // Access denied
	}

	const processSelectSchema = createSelectSchema(processes)
	return processSelectSchema.parse(row)
}
