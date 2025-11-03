'use server'

import { makeSupabaseServerClient } from '@modules/auth/factories'

export async function userAuthAction() {
	const supabase = await makeSupabaseServerClient()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	return { user, error }
}
