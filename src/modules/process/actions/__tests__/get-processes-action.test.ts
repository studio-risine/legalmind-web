import type { Process } from '@infra/db/schemas/processes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProcessesAction } from '../get-processes-action'

vi.mock('@infra/db')
vi.mock('@modules/account/utils/get-current-account')

describe('Get Processes Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return paginated processes', async () => {
		const mockProcesses: Process[] = [
			{
				id: 'process-1',
				account_id: 1,
				title: 'Process 1',
				cnj: '1234567-89.2023.8.26.0000',
				court: 'TJSP',
				status: 'ACTIVE',
				client_id: null,
				tags: null,
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
				archived_at: null,
			},
			{
				id: 'process-2',
				account_id: 1,
				title: 'Process 2',
				cnj: '7654321-89.2023.8.26.0001',
				court: 'TJRJ',
				status: 'ACTIVE',
				client_id: null,
				tags: null,
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
				archived_at: null,
			},
		]

		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					orderBy: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue({
							offset: vi.fn().mockResolvedValue(mockProcesses),
						}),
					}),
				}),
			}),
		} as never)

		// Mock count query
		vi.mocked(db.select).mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					orderBy: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue({
							offset: vi.fn().mockResolvedValue(mockProcesses),
						}),
					}),
				}),
			}),
		} as never)

		vi.mocked(db.select).mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([{ total: 2 }]),
			}),
		} as never)

		const result = await getProcessesAction({
			page: 1,
			perPage: 10,
		})

		expect(result.data).toHaveLength(2)
		expect(result.total).toBe(2)
	})

	it('should filter by status', async () => {
		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(db.select).mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					orderBy: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue({
							offset: vi.fn().mockResolvedValue([]),
						}),
					}),
				}),
			}),
		} as never)

		vi.mocked(db.select).mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					orderBy: vi.fn().mockReturnValue({
						limit: vi.fn().mockReturnValue({
							offset: vi.fn().mockResolvedValue([]),
						}),
					}),
				}),
			}),
		} as never)

		vi.mocked(db.select).mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([{ total: 0 }]),
			}),
		} as never)

		const result = await getProcessesAction({
			status: 'ARCHIVED',
			page: 1,
			perPage: 10,
		})

		expect(result.data).toEqual([])
	})

	it('should return error if no account context', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(null)

		const result = await getProcessesAction({
			page: 1,
			perPage: 10,
		})

		expect(result.data).toBeNull()
		expect(result.error).toBe('No account context.')
	})
})
