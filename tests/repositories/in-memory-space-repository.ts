import type { Space, SpaceInsert } from '@infra/db/schemas/spaces'
import { uuidv7 } from 'uuidv7'

export class InMemorySpaceRepository {
	public items: Space[] = []
	public accountSpaceRelations: { spaceId: string; accountId: string }[] = []

	async create(data: Omit<SpaceInsert, 'id'>, accountId: string): Promise<Space> {
		const space: Space = {
			id: uuidv7(),
			name: data.name || null,
			created_at: new Date(),
			updated_at: null,
			deleted_at: null,
			created_by: data.created_by,
		}

		this.items.push(space)
		this.accountSpaceRelations.push({ spaceId: space.id, accountId })

		return space
	}

	async update(
		id: string,
		data: Partial<Omit<SpaceInsert, 'id'>>,
		accountId: string,
	): Promise<Space | null> {
		const hasAccess = this.accountSpaceRelations.some(
			(rel) => rel.spaceId === id && rel.accountId === accountId,
		)

		if (!hasAccess) {
			return null
		}

		const index = this.items.findIndex((item) => item.id === id)
		if (index === -1) {
			return null
		}

		const updated = {
			...this.items[index],
			...data,
			updated_at: new Date(),
		}

		this.items[index] = updated
		return updated
	}

	async delete(id: string, accountId: string): Promise<boolean> {
		const hasAccess = this.accountSpaceRelations.some(
			(rel) => rel.spaceId === id && rel.accountId === accountId,
		)

		if (!hasAccess) {
			return false
		}

		const index = this.items.findIndex((item) => item.id === id)
		if (index === -1) {
			return false
		}

		this.items[index] = {
			...this.items[index],
			deleted_at: new Date(),
		}

		return true
	}

	async findById(id: string, accountId: string): Promise<Space | null> {
		const hasAccess = this.accountSpaceRelations.some(
			(rel) => rel.spaceId === id && rel.accountId === accountId,
		)

		if (!hasAccess) {
			return null
		}

		const space = this.items.find(
			(item) => item.id === id && !item.deleted_at,
		)
		return space || null
	}

	async findByAccountId(accountId: string): Promise<Space[]> {
		const spaceIds = this.accountSpaceRelations
			.filter((rel) => rel.accountId === accountId)
			.map((rel) => rel.spaceId)

		return this.items.filter(
			(space) => spaceIds.includes(space.id) && !space.deleted_at,
		)
	}

	clear(): void {
		this.items = []
		this.accountSpaceRelations = []
	}
}
