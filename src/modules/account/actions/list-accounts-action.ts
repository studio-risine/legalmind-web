'use server'

import { db } from '@infra/db'
import { type Account, accounts } from '@infra/db/schemas/accounts'
import { isNull } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'

export async function listAccountsAction(): Promise<Account[]> {
	try {

		const rows = await db
			.select()
			.from(accounts)
			.where(isNull(accounts.deleted_at))
			.orderBy(accounts.created_at)

		const accountSelectSchema = createSelectSchema(accounts)
		return rows.map((row) => accountSelectSchema.parse(row))
	} catch (error) {
		console.error('Failed to list accounts:', error)
		return []
	}
}
