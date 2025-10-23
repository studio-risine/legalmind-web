'use client'

import { useParams } from 'next/navigation'

/**
 * Hook to access the current spaceId from the URL.
 * Must be used within routes that follow the pattern /space/[id]/...
 *
 * @returns The spaceId extracted from the URL params.
 * @throws Error if used outside of a space context.
 */
export function useSpaceId(): string {
	const params = useParams()
	const spaceId = params?.id as string | undefined

	if (!spaceId) {
		throw new Error(
			'useSpaceId must be used within a route that has a spaceId parameter (/space/[id]/...)',
		)
	}

	return spaceId
}

/**
 * Hook to generate routes with the current spaceId.
 * Useful for programmatic navigation.
 *
 * @returns Function to generate routes with spaceId.
 */
export function useSpaceRoute() {
	const spaceId = useSpaceId()

	const getRoute = (path: string): string => {
		const cleanPath = path.startsWith('/') ? path.slice(1) : path
		return `/space/${spaceId}/${cleanPath}`
	}

	return { spaceId, getRoute }
}
