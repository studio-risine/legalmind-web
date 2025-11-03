'use server'

import type { Account } from '@infra/db/schemas'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { UnauthorizedError } from '@shared/errors'
import { cache } from 'react'

export const currentAccountAction = cache(
	async (): Promise<{ account: Account | undefined }> => {
		const { user } = await userAuthAction()

		if (!user) {
			throw new UnauthorizedError()
		}

		const userId = user.id

		const accountRepository = makeAccountRepository()
		const account = await accountRepository.findByUserId(userId)

		return {
			account,
		}
	},
)
