import type { Process } from '@infra/db/schemas/processes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { updateProcessAction } from '../update-process-action'

vi.mock('@infra/db')
vi.mock('@modules/account/utils/get-current-account')
vi.mock('next/cache')

describe('Update Process Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should update a process successfully', async () => {
		const mockProcess: Process = {
			id: 'process-1',
			space_id: 'space-1',
			title: 'Updated Process',
			cnj: '1234567-89.2023.8.26.0000',
			court: 'TJSP',
			status: 'ACTIVE',
			client_id: null,
			tags: null,
			created_at: new Date(),
			updated_at: new Date(),
			deleted_at: null,
			archived_at: null,
		}

		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue('account-1')

		// Mock getting the process
		vi.mocked(db.select).mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([{ space_id: 'space-1' }]),
				}),
			}),
		} as never)

		// Mock checking membership
		vi.mocked(db.select).mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([{ accountId: 'account-1' }]),
				}),
			}),
		} as never)

		vi.mocked(db.update).mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockProcess]),
				}),
			}),
		} as never)

		const input = {
			id: 'process-1',
			title: 'Updated Process',
			court: 'TJSP',
		}

		const result = await updateProcessAction(input)

		expect(result.success).toBe(true)
		expect(result.data?.title).toBe('Updated Process')
	})

	it('should return error if process not found', async () => {
		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue('account-1')
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([]),
				}),
			}),
		} as never)

		const input = {
			id: 'non-existent',
			title: 'Updated Process',
		}

		const result = await updateProcessAction(input)

		expect(result.success).toBe(false)
		expect(result.error).toBe('Process not found')
	})

	it('should return error if no account context', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)
		vi.mocked(getCurrentAccountId).mockResolvedValue(null)

		const input = {
			id: 'process-1',
			title: 'Updated Process',
		}

		const result = await updateProcessAction(input)

		expect(result.success).toBe(false)
		expect(result.error).toBe('No account found')
	})

	it('should return error if input validation fails', async () => {
		const input = {
			id: '', // Invalid: empty ID
			title: 'Updated Process',
		}

		const result = await updateProcessAction(input)

		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
	})
})
