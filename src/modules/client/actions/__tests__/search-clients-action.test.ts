import type { Client } from '@infra/db/schemas/clients'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let rowsMock: Client[] = []
let countTotalMock = 0

vi.mock('@infra/db', () => {
	const selectChain = {
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		offset: vi.fn().mockImplementation(async () => rowsMock),
	}
	const countChain = {
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockImplementation(async () => [{ total: countTotalMock }]),
	}
	const db = {
		select: vi.fn((arg?: unknown) => {
			// If selecting count, return count chain
			const obj = arg as { total?: unknown } | undefined
			if (obj && Object.hasOwn(obj, 'total')) {
				return countChain
			}
			return selectChain
		}),
	}
	return { db }
})

import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { searchClientsAction } from '../search-clients-action'

describe('searchClientsAction', () => {
	beforeEach(() => {
		rowsMock = []
		countTotalMock = 0
		// Ensure default account context is present unless overridden per test
		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
	})

	it('returns empty when there is no account context', async () => {
		vi.mocked(getCurrentAccountId).mockResolvedValueOnce(null)

		const res = await searchClientsAction({ q: 'abc', page: 1, pageSize: 10 })
		expect(res.error).toBeDefined()
		expect(res.customers).toEqual([])
		expect(res.total).toBe(0)
		expect(res.hasMore).toBe(false)
	})

	it('returns customers, total and hasMore=false when pageSize >= total', async () => {
		const now = new Date()
		rowsMock = [
			{
				id: 'c1',
				name: 'Alice',
				email: 'a@example.com',
				phone: '',
				tax_id: '',
				type: 'INDIVIDUAL',
				status: 'ACTIVE',
				account_id: 1,
				notes: null,
				updated_at: null,
				deleted_at: null,
				created_at: now,
			},
			{
				id: 'c2',
				name: 'Bob',
				email: 'b@example.com',
				phone: '',
				tax_id: '',
				type: 'INDIVIDUAL',
				status: 'INACTIVE',
				account_id: 1,
				notes: null,
				updated_at: null,
				deleted_at: null,
				created_at: now,
			},
		]
		countTotalMock = 2

		const res = await searchClientsAction({ q: 'a', page: 1, pageSize: 10 })
		expect(res.error).toBeUndefined()
		expect(res.customers).toHaveLength(2)
		expect(res.total).toBe(2)
		expect(res.hasMore).toBe(false)
	})

	it('hasMore=true when there are more rows beyond current page', async () => {
		const now = new Date()
		rowsMock = [
			{
				id: 'c1',
				name: 'Alice',
				email: 'a@example.com',
				phone: '',
				tax_id: '',
				type: 'INDIVIDUAL',
				status: 'ACTIVE',
				account_id: 1,
				notes: null,
				updated_at: null,
				deleted_at: null,
				created_at: now,
			},
		]
		countTotalMock = 5

		const res = await searchClientsAction({ q: 'a', page: 1, pageSize: 1 })
		expect(res.hasMore).toBe(true)
	})
})
