'use server'

import type { Account } from '@infra/db/schemas'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { ResourceNotFoundError, UnauthorizedError } from '@shared/errors'
import { cache } from 'react'

export const accountByIdAction = cache(
	async ({ id }: { id: string }): Promise<{ account: Account | undefined }> => {
		const accountRepository = makeAccountRepository()
		const account = await accountRepository.findById(id)

		if (!account) {
			throw new ResourceNotFoundError()
		}

		const { user } = await userAuthAction()
		const isAccountOwner = user && account.userId === user?.id

		if (!isAccountOwner) {
			throw new UnauthorizedError()
		}

		return {
			account,
		}
	},
)
