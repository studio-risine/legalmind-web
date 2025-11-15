import { randomUUID } from 'node:crypto'
import type { Client, InsertClient } from '@infra/db/schemas'
import type {
	ClientRepository,
	DeleteClientParams,
	FindById,
	FindManyParams,
	UpdateClientParams,
} from './client-repository'

// In-memory implementation for fast unit tests of actions and repository contract.
export class MemoryClientRepository implements ClientRepository {
	private items: Client[] = []

	async insert(params: InsertClient): Promise<{ clientId: string }> {
		const id = randomUUID()
		const now = new Date()
		const client: Client = {
			createdAt: now,
			deletedAt: null,
			documentNumber: params.documentNumber,
			email: params.email ?? null,
			id,
			name: params.name,
			phoneNumber: params.phoneNumber ?? null,
			spaceId: params.spaceId,
			status: params.status,
			type: params.type,
			updatedAt: now,
		}
		this.items.push(client)
		return { clientId: client.id }
	}

	async findById(params: FindById): Promise<Client | undefined> {
		return this.items.find(
			(client) =>
				client.id === params.id &&
				client.spaceId === params.spaceId &&
				client.deletedAt === null,
		)
	}

	async findMany(
		params: FindManyParams,
	): Promise<{ data: Client[]; total: number }> {
		let list = this.items.filter(
			(client) =>
				client.spaceId === params.spaceId && client.deletedAt === null,
		)
		if (params.search) {
			const s = params.search.toLowerCase()
			list = list.filter(
				(client) =>
					client.name.toLowerCase().includes(s) ||
					(client.email?.toLowerCase().includes(s) ?? false) ||
					client.documentNumber.toLowerCase().includes(s),
			)
		}
		if (params.status) list = list.filter((c) => c.status === params.status)
		if (params.type) list = list.filter((c) => c.type === params.type)
		const total = list.length
		const offset = params.offset ?? 0
		const limit = params.limit ?? 25
		return {
			data: list.slice(offset, offset + limit),
			total,
		}
	}

	async update(params: UpdateClientParams): Promise<{ clientId: string }> {
		const idx = this.items.findIndex(
			(client) =>
				client.id === params.id &&
				client.spaceId === params.spaceId &&
				client.deletedAt === null,
		)
		if (idx === -1) return { clientId: '' }
		const current = this.items[idx]
		this.items[idx] = {
			...current,
			...params.data,
			updatedAt: new Date(),
		}
		return { clientId: this.items[idx].id }
	}

	async delete(params: DeleteClientParams): Promise<void> {
		const result = this.items.find(
			(client) =>
				client.id === params.id &&
				client.spaceId === params.spaceId &&
				client.deletedAt === null,
		)
		if (result) result.deletedAt = new Date()
	}
}
