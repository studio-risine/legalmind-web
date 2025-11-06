import type { ClientRepository } from '../repositories/client-repository'
import { DrizzleClientRepository } from '../repositories/drizzle-client-repository'

/**
 * @returns New instance of ClientRepository
 * @example
 * ```ts
 * const clientRepository = makeClientRepository()
 * const client = await clientRepository.findById({ id: 'client-123', spaceId: 'space-123' })
 * ```
 */
export function makeClientRepository(): ClientRepository {
	return new DrizzleClientRepository()
}

/**
 * Singleton of ClientRepository
 * Reuses the same instance throughout the application
 *
 * @returns Singleton instance of ClientRepository
 */

let clientRepositoryInstance: ClientRepository | null = null

export function clientRepository(): ClientRepository {
	if (!clientRepositoryInstance) {
		clientRepositoryInstance = makeClientRepository()
	}
	return clientRepositoryInstance
}
