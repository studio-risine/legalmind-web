import type { Account, AccountInsert } from '@infra/db/schemas/accounts'
import { uuidv7 } from 'uuidv7'

export class InMemoryAccountRepository {
	public items: Account[] = []

	async create(data: Omit<AccountInsert, 'id'>): Promise<Account> {
		const account: Account = {
			id: uuidv7(),
			name: data.name || null,
			displayName: data.displayName || null,
			email: data.email || null,
			created_at: new Date(),
			updated_at: null,
			deleted_at: null,
		}

		this.items.push(account)
		return account
	}

	async update(
		id: string,
		data: Partial<Omit<AccountInsert, 'id'>>,
	): Promise<Account | null> {
		const index = this.items.findIndex(
			(item) => item.id === id && !item.deleted_at,
		)
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

	async delete(id: string): Promise<boolean> {
		const index = this.items.findIndex(
			(item) => item.id === id && !item.deleted_at,
		)
		if (index === -1) {
			return false
		}

		this.items[index] = {
			...this.items[index],
			deleted_at: new Date(),
		}

		return true
	}

	async findById(id: string): Promise<Account | null> {
		const account = this.items.find(
			(item) => item.id === id && !item.deleted_at,
		)
		return account || null
	}

	async findAll(): Promise<Account[]> {
		return this.items.filter((account) => !account.deleted_at)
	}

	async findByEmail(email: string): Promise<Account | null> {
		const account = this.items.find(
			(item) => item.email === email && !item.deleted_at,
		)
		return account || null
	}

	clear(): void {
		this.items = []
	}
}
