import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Client } from '@/infra/db/schemas/clients'

let rowsMock: Client[] = []

vi.mock('@/infra/db', () => {
	const chain = {
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockImplementation(async () => rowsMock),
	}
	const db = {
		select: vi.fn(() => chain),
	}
	return { db }
})

import { getClientByIdAction } from '../get-client-by-id-action'

describe('getClientByIdAction', () => {
	beforeEach(() => {
		rowsMock = []
	})

	it('returns client when found', async () => {
		const now = new Date()
		rowsMock = [
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

		const res = await getClientByIdAction({ id: 'c1' })
		expect(res?.id).toBe('c1')
	})

	it('returns null when not found', async () => {
		rowsMock = []
		const res = await getClientByIdAction({ id: 'c2' })
		expect(res).toBeNull()
	})
})
