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

	const space = await getFirstSpaceAction({ id: user.id })

	space ? redirect(`/space/${space.id}`) : redirect('/onboarding')
}
