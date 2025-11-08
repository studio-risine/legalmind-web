import { headers } from 'next/headers'

export async function getSpaceIdFromHeaders(): Promise<string | null> {
	const headersList = await headers()
	const spaceId = headersList.get('x-space-id')

	if (!spaceId) {
		return null
	}

	return spaceId
}
