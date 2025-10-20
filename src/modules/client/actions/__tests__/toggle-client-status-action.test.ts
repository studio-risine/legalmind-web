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

import { toggleClientStatusAction } from '../toggle-client-status-action'

describe('toggleClientStatusAction', () => {
	beforeEach(() => {
		returningMock = []
	})

	it('updates status and returns data on success', async () => {
		const now = new Date()
		returningMock = [
			{
				id: 'c1',
				account_id: 1,
				type: 'INDIVIDUAL',
				status: 'INACTIVE',
				name: 'Alice',
				email: null,
				phone: null,
				tax_id: null,
				notes: null,
				created_at: now,
				updated_at: now,
				deleted_at: null,
			},
		]

		const res = await toggleClientStatusAction({ id: 'c1', status: 'INACTIVE' })
		expect(res.success).toBe(true)
		expect(res.data?.status).toBe('INACTIVE')
	})

	it('returns error when client not found', async () => {
		returningMock = []
		const res = await toggleClientStatusAction({ id: 'c2', status: 'ACTIVE' })
		expect(res.success).toBe(false)
		expect(res.error).toMatch(/Client not found/)
	})
})
