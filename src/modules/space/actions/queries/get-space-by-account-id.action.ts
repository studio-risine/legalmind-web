'use server'

import type { Space } from '@infra/db/schemas'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { makeSpaceRepository } from '@modules/space/factories'
import { ResourceNotFoundError, UnauthorizedError } from '@shared/errors'
import { cache } from 'react'

interface GetSpaceByAccountIdOutput {
	space: Space | undefined
}

export const getSpaceByAccountIdAction = cache(
	async ({
		accountId,
	}: {
		accountId: string
	}): Promise<GetSpaceByAccountIdOutput> => {
		const { user } = await userAuthAction()

		if (!user) {
			throw new UnauthorizedError()
		}

		const accountRepository = makeAccountRepository()
		const account = await accountRepository.findById(accountId)

		if (!account) {
			throw new ResourceNotFoundError()
		}

		if (account.userId !== user.id) {
			throw new UnauthorizedError()
		}

		const spaceRepository = makeSpaceRepository()
		const space = await spaceRepository.findByAccountId({ accountId })

		return {
			space,
		}
	},
)
