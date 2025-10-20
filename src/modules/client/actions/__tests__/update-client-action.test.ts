import type { Client } from '@infra/db/schemas/clients'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let returningMock: Client[] = []

vi.mock('@infra/db', () => {
	const chain = {
		set: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		returning: vi.fn().mockImplementation(async () => returningMock),
	}
	const db = {
		update: vi.fn(() => chain),
	}
	return { db }
})

import { updateClientAction } from '../update-client-action'

describe('updateClientAction', () => {
	beforeEach(() => {
		returningMock = []
	})

	it('updates client and returns data on success', async () => {
		const now = new Date()
		returningMock = [
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
				updated_at: now,
				deleted_at: null,
			},
		]

		const res = await updateClientAction({
			id: 'c1',
			name: 'Alice',
			email: 'a@example.com',
			phone: '',
		})
		expect(res.success).toBe(true)
		expect(res.data?.id).toBe('c1')
	})

	it('returns error when client not found', async () => {
		returningMock = []
		const res = await updateClientAction({
			id: 'c2',
			name: 'Bob',
			email: '',
			phone: '',
		})
		expect(res.success).toBe(false)
		expect(res.error).toMatch(/Client not found/)
	})
})
