import { currentAccountAction } from '@modules/account/actions'
import { getSpaceByAccountIdAction } from '@modules/space/actions'
import { ResourceNotFoundError } from '@shared/errors'
import { redirect } from 'next/navigation'

export default async function Page() {
	const { account } = await currentAccountAction()

	if (!account) {
		throw new ResourceNotFoundError()
	}

	const { space } = await getSpaceByAccountIdAction({
		accountId: account.id,
	})

	if (!space) {
		redirect(`/account/onboarding?accountId=${account.id}`)
	}

	redirect(`/space/${space.id}`)
}
