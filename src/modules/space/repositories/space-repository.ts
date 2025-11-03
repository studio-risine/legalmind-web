import type { Space } from '@infra/db/schemas'
import type { CreateSpaceInput } from './drizzle-space-repository'

export interface SpaceRepository {
	create({ data }: CreateSpaceInput): Promise<{ id: string }>
	findById({ id }: { id: string }): Promise<Space | undefined>
	findByAccountId({
		accountId,
	}: {
		accountId: string
	}): Promise<Space | undefined>
}
