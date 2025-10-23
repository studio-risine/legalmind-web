import { PRIVATE_PATH_ROOT } from '@config/routes'
import { createClient } from '@libs/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function AuthGuard({ children }: { children: ReactNode }) {
	const supabase = await createClient()

	const { data } = await supabase.auth.getClaims()

	if (data?.claims) {
		redirect(`/${PRIVATE_PATH_ROOT}`)
	}

	return <>{children}</>
}
