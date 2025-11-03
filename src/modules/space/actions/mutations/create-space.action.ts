'use server'

import type { InsertSpace } from '@infra/db/schemas'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { makeSpaceRepository } from '@modules/space/factories'

export interface CreateSpaceInput {
	accountId: string
	name: string
	type: InsertSpace['type']
	description?: string
}

interface Output {
	spaceId: string
}

export async function createSpaceAction(
	input: CreateSpaceInput,
): Promise<Output> {
	const { user, error } = await userAuthAction()

	if (!user || error) {
		throw new Error('Unauthorized')
	}

	const accountRepository = makeAccountRepository()
	const account = await accountRepository.findById(input.accountId)

	if (!account) {
		throw new Error('Account not found')
	}

	if (account.userId !== user.id) {
		throw new Error('Unauthorized: Account does not belong to current user')
	}

	const spaceRepository = makeSpaceRepository()

	const result = await spaceRepository.create({
		name: input.name,
		type: input.type,
		createdBy: input.accountId,
	})

	return {
		spaceId: result.id,
	}
}
