import type { Process, ProcessInsert } from '@infra/db/schemas/processes'

export interface ProcessFilters {
	status?: string
	searchQuery?: string
	accountId?: number
}

export class InMemoryProcessRepository {
	public items: Process[] = []
	private idCounter = 1

	async create(data: ProcessInsert): Promise<Process> {
		const process: Process = {
			id: `process-${this.idCounter++}`,
			account_id: data.account_id || 1,
			title: data.title || null,
			status: data.status || 'ACTIVE',
			created_at: new Date(),
			updated_at: new Date(),
			archived_at: null,
			deleted_at: null,
			cnj: data.cnj || null,
			court: data.court || null,
			tags: data.tags || null,
			client_id: data.client_id || null,
		}

		this.items.push(process)
		return process
	}

	async update(
		id: string,
		data: Partial<ProcessInsert>,
	): Promise<Process | null> {
		const index = this.items.findIndex((item) => item.id === id)

		if (index === -1) return null

		this.items[index] = {
			...this.items[index],
			...(data as Partial<Process>),
			updated_at: new Date(),
		}

		return this.items[index]
	}

	async delete(id: string): Promise<boolean> {
		const index = this.items.findIndex((item) => item.id === id)

		if (index === -1) return false

		// Soft delete
		this.items[index] = {
			...this.items[index],
			deleted_at: new Date(),
		}

		return true
	}

	async findById(id: string): Promise<Process | null> {
		const process = this.items.find(
			(item) => item.id === id && !item.deleted_at,
		)
		return process || null
	}

	async findAll(filters?: ProcessFilters): Promise<Process[]> {
		let results = this.items.filter((item) => !item.deleted_at)

		if (filters?.accountId) {
			results = results.filter((item) => item.account_id === filters.accountId)
		}

		if (filters?.status) {
			results = results.filter((item) => item.status === filters.status)
		}

		if (filters?.searchQuery) {
			const query = filters.searchQuery.toLowerCase()
			results = results.filter(
				(item) =>
					item.title?.toLowerCase().includes(query) ||
					item.cnj?.toLowerCase().includes(query) ||
					item.court?.toLowerCase().includes(query),
			)
		}

		return results
	}

	async search(query: string): Promise<Process[]> {
		const lowerQuery = query.toLowerCase()
		return this.items.filter(
			(item) =>
				!item.deleted_at &&
				(item.title?.toLowerCase().includes(lowerQuery) ||
					item.cnj?.toLowerCase().includes(lowerQuery) ||
					item.court?.toLowerCase().includes(lowerQuery)),
		)
	}

	async count(filters?: ProcessFilters): Promise<number> {
		const results = await this.findAll(filters)
		return results.length
	}

	clear(): void {
		this.items = []
		this.idCounter = 1
	}
}
