import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Client } from '@/infra/db/schemas/clients'

let rowsMock: Client[] = []
let countTotalMock = 0

vi.mock('@infra/db', () => {
	const rowsChain = {
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
			const obj = arg as { total?: unknown } | undefined
			if (obj && Object.hasOwn(obj, 'total')) {
				return countChain
			}
			return rowsChain
		}),
	}
	return { db }
})

import { getCurrentAccountId } from '@/modules/account/utils/get-current-account'
import { getClientsAction } from '../get-clients-action'

describe('getClientsAction', () => {
	beforeEach(() => {
		rowsMock = []
		countTotalMock = 0
		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
	})

	it('returns error when no account context', async () => {
		vi.mocked(getCurrentAccountId).mockResolvedValueOnce(null)
		const res = await getClientsAction({
			searchQuery: 'Ali',
			page: 1,
			perPage: 10,
		})
		expect(res.data).toBeNull()
		expect(res.total).toBeNull()
		expect(res.error).toBeDefined()
	})

	it('returns rows and total on success', async () => {
		const now = new Date()
		rowsMock = [
			{
				id: 'c1',
				account_id: 1,
				type: 'INDIVIDUAL',
				status: 'ACTIVE',
				name: 'Alice',
				email: 'a@example.com',
				phone: null,
				tax_id: null,
				notes: null,
				created_at: now,
				updated_at: null,
				deleted_at: null,
			},
			{
				id: 'c2',
				account_id: 1,
				type: 'INDIVIDUAL',
				status: 'INACTIVE',
				name: 'Bob',
				email: null,
				phone: null,
				tax_id: null,
				notes: null,
				created_at: now,
				updated_at: null,
				deleted_at: null,
			},
		]
		countTotalMock = 2

		const res = await getClientsAction({
			searchQuery: 'A',
			page: 1,
			perPage: 2,
		})
		expect(res.error).toBeUndefined()
		expect(res.data).toHaveLength(2)
		expect(res.total).toBe(2)
	})
})
