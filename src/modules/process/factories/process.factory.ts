import { DrizzleProcessRepository } from '../repositories/drizzle-process-repository'
import type { ProcessRepository } from '../repositories/process-repository'

/**
 * @returns New instance of ProcessRepository
 * @example
 * ```ts
 * const processRepository = makeProcessRepository()
 * const process = await processRepository.findById({ id: 'process-123', spaceId: 'space-123' })
 * ```
 */
export function makeProcessRepository(): ProcessRepository {
	return new DrizzleProcessRepository()
}

/**
 * Singleton of ProcessRepository
 * Reuses the same instance throughout the application
 *
 * @returns Singleton instance of ProcessRepository
 */

let processRepositoryInstance: ProcessRepository | null = null

export function getProcessRepository(): ProcessRepository {
	if (!processRepositoryInstance) {
		processRepositoryInstance = makeProcessRepository()
	}
	return processRepositoryInstance
}
