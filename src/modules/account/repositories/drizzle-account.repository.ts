import { db } from '@infra/db'
import { type Account, accounts, type InsertAccount } from '@infra/db/schemas'

import { eq } from 'drizzle-orm'
import type {
	AccountRepository,
	UpdateAccountInput,
} from './account.repository'

export class DrizzleAccountRepository implements AccountRepository {
	async update({
		accountId,
		data,
	}: UpdateAccountInput): Promise<{ accountId: string }> {
		const [result] = await db
			.update(accounts)
			.set(data)
			.where(eq(accounts.id, accountId))
			.returning({ id: accounts.id })

		return {
			accountId: result.id,
		}
	}

	async findById(id: string): Promise<Account | undefined> {
		const result = await db.query.accounts.findFirst({
			where: (accounts, { eq }) => eq(accounts.id, id),
		})

		return result
	}

	async findByUserId(userId: string): Promise<Account | undefined> {
		const account = await db.query.accounts.findFirst({
			where: (accounts, { eq }) => eq(accounts.userId, userId),
		})

		return account
	}

	async insert(data: InsertAccount): Promise<{ accountId: string }> {
		const [result] = await db
			.insert(accounts)
			.values(data)
			.returning({ id: accounts.id })

		return {
			accountId: result.id,
		}
	}
}
