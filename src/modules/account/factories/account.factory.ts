import type { AccountRepository } from '../repositories/account.repository'
import { DrizzleAccountRepository } from '../repositories/drizzle-account.repository'

export function makeAccountRepository(): AccountRepository {
	return new DrizzleAccountRepository()
}

let accountRepositoryInstance: AccountRepository | null = null

export function getAccountRepository(): AccountRepository {
	if (!accountRepositoryInstance) {
		accountRepositoryInstance = makeAccountRepository()
	}
	return accountRepositoryInstance
}
