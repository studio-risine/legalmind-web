import type { Client } from '@infra/db/schemas/clients'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let returningMock: Client[] = []

vi.mock('@infra/db', () => {
	const chain = {
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockImplementation(async () => returningMock),
	}
	const db = {
		insert: vi.fn(() => chain),
	}
	return { db }
})

import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { revalidatePath } from 'next/cache'
import { insertClientAction } from '../insert-client-action'

describe('insertClientAction', () => {
	beforeEach(() => {
		returningMock = []
		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(revalidatePath).mockClear()
	})

	it('fails when account context is missing', async () => {
		vi.mocked(getCurrentAccountId).mockResolvedValueOnce(null)

		const res = await insertClientAction({
			name: 'A',
			email: '',
			phone: '',
			tax_id: '',
		})
		expect(res.success).toBe(false)
		expect(res.error).toMatch(/No account/)
	})

	it('creates client and revalidates path on success', async () => {
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

		const res = await insertClientAction({
			name: 'Alice',
			email: 'a@example.com',
			phone: '',
			tax_id: '',
		})
		expect(res.success).toBe(true)
		expect(res.data?.id).toBe('c1')
		expect(revalidatePath).toHaveBeenCalledWith('/dashboard/clients')
	})

	it('fails when insert returns no rows', async () => {
		returningMock = []
		const res = await insertClientAction({
			name: 'Bob',
			email: '',
			phone: '',
			tax_id: '',
		})
		expect(res.success).toBe(false)
		expect(res.error).toMatch(/Failed to create client/i)
	})
})
