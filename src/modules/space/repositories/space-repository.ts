import type { InsertSpace, Space } from '@infra/db/schemas'

export interface SpaceRepository {
	insert(data: InsertSpace): Promise<{ spaceId: string }>
	findById({ id }: { id: string }): Promise<Space | undefined>
	findByAccountId({
		accountId,
	}: {
		accountId: string
	}): Promise<Space | undefined>
}
