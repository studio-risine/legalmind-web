import type { DeadlineRepository } from '../repositories/deadline-repository'
import { DrizzleDeadlineRepository } from '../repositories/drizzle-deadline-repository'

/**
 * @returns New instance of DeadlineRepository
 * @example
 * ```ts
 * const deadlineRepository = makeDeadlineRepository()
 * const deadline = await deadlineRepository.findById({ id: 'deadline-123', spaceId: 'space-123' })
 * ```
 */
export function makeDeadlineRepository(): DeadlineRepository {
	return new DrizzleDeadlineRepository()
}

/**
 * Singleton of DeadlineRepository
 * Reuses the same instance throughout the application
 *
 * @returns Singleton instance of DeadlineRepository
 */

let deadlineRepositoryInstance: DeadlineRepository | null = null

export function getDeadlineRepository(): DeadlineRepository {
	if (!deadlineRepositoryInstance) {
		deadlineRepositoryInstance = makeDeadlineRepository()
	}
	return deadlineRepositoryInstance
}
