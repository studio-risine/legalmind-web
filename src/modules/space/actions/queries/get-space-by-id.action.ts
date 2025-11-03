'use server'

import type { Space } from '@infra/db/schemas'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import { makeSpaceRepository } from '@modules/space/factories'
import { ResourceNotFoundError, UnauthorizedError } from '@shared/errors'
import { cache } from 'react'

export const getSpaceByIdAction = cache(
	async ({ id }: { id: string }): Promise<{ space: Space | undefined }> => {
		const { user } = await userAuthAction()

		if (!user) {
			throw new UnauthorizedError()
		}

		const spaceRepository = makeSpaceRepository()
		const space = await spaceRepository.findById({
			id,
		})

		if (!space) {
			throw new ResourceNotFoundError()
		}

		return {
			space,
		}
	},
)
