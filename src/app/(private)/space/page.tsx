import { createClient } from '@libs/supabase/server'
import { getAccountByIdAction } from '@modules/account'
import { getFirstSpaceAction } from '@modules/space'
import { notFound, redirect } from 'next/navigation'

export default async function Page() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/error?reason=unauthenticated')
	}


	const { data: account } = await getAccountByIdAction({ accountId: user.id })

	/*
	 * TODO: create onboarding flow
	 */
	if(!account) {
		notFound()
	}

	const { data: space } = await getFirstSpaceAction({ accountId: account.id })

	if (!space) {
		redirect('/onboarding?reason=new-space')
	}

	redirect(`/space/${space.id}`)
}
