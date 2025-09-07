'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function useRedirect() {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const fallbackRoute = '/'

	const redirectTo = ({ route = fallbackRoute }) => {
		startTransition(() => {
			router.push(route)
		})
	}

	return {
		isPending,
		redirectTo,
	}
}
