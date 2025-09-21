import { createClient } from '@libs/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function ProtectedGuard({
	children,
}: {
	children: ReactNode
}) {
	const supabase = await createClient()

	const { data, error } = await supabase.auth.getClaims()

	if (error || !data?.claims) {
		redirect('/account/login')
	}

	return <>{children}</>
}
