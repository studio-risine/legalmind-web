import type { Process } from '@infra/db/schemas/processes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { searchProcessesAction } from '../search-processes-action'

vi.mock('@infra/db')
vi.mock('@modules/account/utils/get-current-account')

describe('Search Processes Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should search processes by query', async () => {
		const mockProcesses: Process[] = [
			{
				id: 'process-1',
				space_id: 'space-1',
				title: 'Important Legal Process',
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
		]

		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue('account-1')

		// Mock getting user spaces
		vi.mocked(db.select).mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				innerJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([{ id: 'space-1' }]),
				}),
			}),
		} as never)

		// Mock for count query
		vi.mocked(db.select).mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([{ total: 1 }]),
			}),
		} as never)

		// Mock for select query
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

		const result = await searchProcessesAction({
			q: 'Legal',
			page: 1,
			pageSize: 20,
		})

		expect(result.processes).toHaveLength(1)
		expect(result.total).toBe(1)
		expect(result.hasMore).toBe(false)
	})

	it('should filter by status', async () => {
		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue('account-1')
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

		const result = await searchProcessesAction({
			status: 'ARCHIVED',
			page: 1,
			pageSize: 20,
		})

		expect(result.processes).toEqual([])
	})

	it('should return empty array if no account context', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(null)

		const result = await searchProcessesAction({
			q: 'Test',
			page: 1,
			pageSize: 20,
		})

		expect(result.processes).toEqual([])
		expect(result.error).toBe('No account context.')
	})

	it('should calculate hasMore correctly', async () => {
		const mockProcesses: Process[] = Array.from({ length: 20 }, (_, i) => ({
			id: `process-${i + 1}`,
			account_id: '1',
			title: `Process ${i + 1}`,
			cnj: `${i + 1}234567-89.2023.8.26.0000`,
			court: 'TJSP',
			status: 'ACTIVE',
			client_id: null,
			tags: null,
			created_at: new Date(),
			updated_at: new Date(),
			deleted_at: null,
			archived_at: null,
		}))

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
				where: vi.fn().mockResolvedValue([{ total: 50 }]),
			}),
		} as never)

		const result = await searchProcessesAction({
			page: 1,
			pageSize: 20,
		})

		expect(result.hasMore).toBe(true)
		expect(result.total).toBe(50)
	})
})
