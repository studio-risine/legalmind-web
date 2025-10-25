'use server'

import { ResourceNotFoundError } from '@errors/resource-not-found-error'
import { db } from '@infra/db'
import { type Account, accounts } from '@infra/db/schemas/accounts'
import { createValidatedActionWithOutput } from '@libs/zod'
import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const inputSchema = z.object({
	accountId: z.string().min(1),
})

const outputSchema = createSelectSchema(accounts)

export type GetAccountByIdInput = z.input<typeof inputSchema>

const handleAction = async ({
	accountId,
}: GetAccountByIdInput): Promise<Account> => {

	const account = await db
		.select()
		.from(accounts)
		.where(eq(accounts.id, accountId))
		.limit(1)
		.then((result) => result[0])

	if (!account) {
		throw new ResourceNotFoundError('Account')
	}

	return account
}

export const getAccountByIdAction = createValidatedActionWithOutput(
	inputSchema,
	outputSchema,
)(handleAction)

