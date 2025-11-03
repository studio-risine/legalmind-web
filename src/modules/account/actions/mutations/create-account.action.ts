'use server'

import { makeAccountRepository } from '@modules/account/factories'

export interface InsertAccountInput {
	userId: string
	email: string
	displayName: string
}

interface Output {
	accountId: string
}

export async function createAccountAction(
	input: InsertAccountInput,
): Promise<Output> {
	const accountRepository = makeAccountRepository()

	const { userId } = input

	const userAccountExists = await accountRepository.findByUserId(userId)

	if (userAccountExists) {
		throw new Error('Account already exists for this user')
	}

	const result = await accountRepository.create({
		userId: input.userId,
		email: input.email,
		displayName: input.displayName,
	})

	return {
		accountId: result.id,
	}
}
