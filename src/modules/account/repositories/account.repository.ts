import type { Account, InsertAccount, UpdateAccount } from '@infra/db/schemas'

export interface UpdateAccountInput {
	accountId: string
	data: UpdateAccount
}

export interface AccountRepository {
	findByUserId(userId: string): Promise<Account | undefined>
	findById(id: string): Promise<Account | undefined>
	insert(data: InsertAccount): Promise<{ accountId: string }>
	update({
		accountId,
		data,
	}: UpdateAccountInput): Promise<{ accountId: string }>
}
