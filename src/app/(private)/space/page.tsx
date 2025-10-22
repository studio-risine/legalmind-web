import { createClient } from '@libs/supabase/server'
import { getFirstSpaceAction } from '@modules/space/actions'
import { redirect } from 'next/navigation'

export default async function Page() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/error?reason=unauthenticated')
	}

	const space = await getFirstSpaceAction({
		accountId: user.id,
	})

	if (!space.success) {
		redirect('/onboarding')
	}
	console.log('Redirecting to space:', space)

	// space ? redirect(`/space/${space.id}`) : redirect('/onboarding')
}
