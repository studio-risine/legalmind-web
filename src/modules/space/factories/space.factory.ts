import { getSpaceIdFromHeaders } from '../http/get-space-id-headers'
import { DrizzleSpaceRepository } from '../repositories/drizzle-space-repository'
import type { SpaceRepository } from '../repositories/space-repository'

/**
 * @returns New instance of SpaceRepository
 * @example
 * ```ts
 * const spaceRepository = makeSpaceRepository()
 * const space = await spaceRepository.findById('space-123')
 * ```
 */
export function makeSpaceRepository(): SpaceRepository {
	return new DrizzleSpaceRepository()
}

/**
 * Singleton of SpaceRepository
 * Reuses the same instance throughout the application
 *
 * @returns Singleton instance of SpaceRepository
 */

let spaceRepositoryInstance: SpaceRepository | null = null

export function getSpaceRepository(): SpaceRepository {
	if (!spaceRepositoryInstance) {
		spaceRepositoryInstance = makeSpaceRepository()
	}
	return spaceRepositoryInstance
}
