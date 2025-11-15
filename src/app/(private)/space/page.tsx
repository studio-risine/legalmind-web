import { accountByUserIdAction } from '@modules/account'
import { getSpaceByAccountIdAction } from '@modules/space/actions'
import { redirect } from 'next/navigation'

export default async function Page() {
	const { data: account } = await accountByUserIdAction()

	if (!account) {
		redirect('/account/onboarding')
	}

	const { data: space } = await getSpaceByAccountIdAction({
		accountId: account._id,
	})

	if (!space) {
		redirect(`/account/onboarding?accountId=${account._id}`)
	}

	redirect(`/space/${space._id}`)
}
