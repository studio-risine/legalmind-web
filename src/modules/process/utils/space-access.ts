import 'server-only'

import { db } from '@infra/db'
import { spacesToAccounts } from '@infra/db/schemas/core'
import { eq } from 'drizzle-orm'

/**
 * Get current user's space ID from authenticated session
 * TODO: Integrate with Supabase Auth to get user ID from session
 * @param userId - User ID from authenticated session
 */
export async function getCurrentSpaceId(userId: string): Promise<string> {
	const result = await db
		.select({ spaceId: spacesToAccounts.spaceId })
		.from(spacesToAccounts)
		.where(eq(spacesToAccounts.accountId, userId))
		.limit(1)

	if (!result[0]) {
		throw new Error('User not associated with any space')
	}

	return result[0].spaceId
}

/**
 * Validate user has access to a specific space
 * @param userId - User ID from authenticated session
 * @param spaceId - Space ID to validate access
 */
export async function validateSpaceAccess(userId: string, spaceId: string): Promise<void> {
	const userSpaceId = await getCurrentSpaceId(userId)

	if (userSpaceId !== spaceId) {
		throw new Error('Unauthorized: User does not have access to this space')
	}
}
