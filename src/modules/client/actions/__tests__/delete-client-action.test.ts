import type { Client } from '@infra/db/schemas/clients'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let returningMock: Client[] = []

vi.mock('@infra/db', () => {
	const chain = {
		where: vi.fn().mockReturnThis(),
		returning: vi.fn().mockImplementation(async () => returningMock),
	}
	const db = {
		delete: vi.fn(() => chain),
	}
	return { db }
})

import { deleteClientAction } from '../delete-client-action'

describe('deleteClientAction', () => {
	beforeEach(() => {
		returningMock = []
	})

	it('deletes client and returns success=true', async () => {
		const now = new Date()
		returningMock = [
			{
				id: 'c1',
				account_id: 1,
				type: 'INDIVIDUAL',
				status: 'ACTIVE',
				name: 'Alice',
				email: null,
				phone: null,
				tax_id: null,
				notes: null,
				created_at: now,
				updated_at: null,
				deleted_at: null,
			},
		]

		const res = await deleteClientAction({ id: 'c1' })
		expect(res.success).toBe(true)
		expect(res.error).toBeUndefined()
	})

	it('returns error when client not found', async () => {
		returningMock = []
		const res = await deleteClientAction({ id: 'c2' })
		expect(res.success).toBe(false)
		expect(res.error).toMatch(/Client not found/)
	})
})
