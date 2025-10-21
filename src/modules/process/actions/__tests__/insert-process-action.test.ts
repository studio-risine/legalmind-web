import type { Process } from '@infra/db/schemas/processes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { insertProcessAction } from '../insert-process-action'

vi.mock('@infra/db')
vi.mock('@modules/account/utils/get-current-account')
vi.mock('next/cache')

describe('Insert Process Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should create a new process', async () => {
		const mockProcess: Process = {
			id: 'process-1',
			account_id: 1,
			title: 'New Process',
			cnj: '1234567-89.2023.8.26.0000',
			court: 'TJSP',
			status: 'ACTIVE',
			client_id: 'client-1',
			tags: ['test', 'important'],
			created_at: new Date(),
			updated_at: new Date(),
			deleted_at: null,
			archived_at: null,
		}

		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([mockProcess]),
			}),
		} as never)

		const input = {
			title: 'New Process',
			cnj: '1234567-89.2023.8.26.0000',
			court: 'TJSP',
			client_id: 'client-1',
			tags: ['test', 'important'],
		}

		const result = await insertProcessAction(input)

		expect(result.success).toBe(true)
		expect(result.data).toBeDefined()
		expect(result.data?.title).toBe('New Process')
	})

	it('should return an error if input validation fails', async () => {
		const input = {
			title: 'Valid Title',
			cnj: '1234567-89.2023.8.26.0000',
			court: 'TJSP',
			client_id: 'client-1',
			tags: 'invalid-tags', // Should be array
		}

		const result = await insertProcessAction(input as never)

		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
	})

	it('should return error if no account context', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(null)

		const input = {
			title: 'New Process',
			cnj: '1234567-89.2023.8.26.0000',
			court: 'TJSP',
			client_id: 'client-1',
			tags: ['test'],
		}

		const result = await insertProcessAction(input)

		expect(result.success).toBe(false)
		expect(result.error).toBe('No account found to associate process.')
	})

	it('should return error if database insert fails', async () => {
		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(db.insert).mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([]),
			}),
		} as never)

		const input = {
			title: 'New Process',
			cnj: '1234567-89.2023.8.26.0000',
			court: 'TJSP',
			client_id: 'client-1',
			tags: ['test'],
		}

		const result = await insertProcessAction(input)

		expect(result.success).toBe(false)
		expect(result.error).toBe('Failed to create process')
	})
})
