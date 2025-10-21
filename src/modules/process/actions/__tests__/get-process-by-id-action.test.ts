import type { Process } from '@infra/db/schemas/processes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProcessByIdAction } from '../get-process-by-id-action'

vi.mock('@infra/db')
vi.mock('@modules/account/utils/get-current-account')

describe('Get Process By ID Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return a process by id', async () => {
		const mockProcess: Process = {
			id: 'process-1',
			account_id: 1,
			title: 'Test Process',
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

		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([mockProcess]),
				}),
			}),
		} as never)

		const result = await getProcessByIdAction({ id: 'process-1' })

		expect(result).not.toBeNull()
		expect(result?.id).toBe('process-1')
		expect(result?.title).toBe('Test Process')
	})

	it('should return null if process not found', async () => {
		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue([]),
				}),
			}),
		} as never)

		const result = await getProcessByIdAction({ id: 'non-existent' })

		expect(result).toBeNull()
	})

	it('should return null if no account context', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(null)

		const result = await getProcessByIdAction({ id: 'process-1' })

		expect(result).toBeNull()
	})
})
