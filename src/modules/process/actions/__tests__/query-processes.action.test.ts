import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/process/factories', () => ({
	getProcessRepository: vi.fn(),
}))

const { userAuthAction } = await import(
	'@modules/auth/actions/user-auth.action'
)
const { getProcessRepository } = await import('@modules/process/factories')
const { queryProcessesWithoutCacheAction: queryProcessesAction } = await import(
	'../queries/query-processes.action'
)

import type { Process } from '@infra/db/schemas'
import type { User } from '@supabase/supabase-js'

function mockRepo() {
	return {
		insert: vi.fn(),
		findById: vi.fn(),
		findMany: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	}
}

function makeProcess(id: string, overrides: Partial<Process> = {}): Process {
	return {
		id,
		spaceId: overrides.spaceId ?? 'b7d6e7f8-a9b0-c1d2-e3f4-567890123456',
		clientId: overrides.clientId ?? '550e8400-e29b-41d4-a716-446655440000',
		title: overrides.title ?? `Process ${id.slice(0, 4)}`,
		description: overrides.description ?? `Description for ${id.slice(0, 4)}`,
		processNumber: overrides.processNumber ?? `P${id.slice(0, 4)}`,
		status: overrides.status ?? 'ACTIVE',
		assignedId: overrides.assignedId ?? '660e8400-e29b-41d4-a716-446655440000',
		deletedAt: overrides.deletedAt ?? null,
		createdAt: overrides.createdAt ?? new Date(),
		updatedAt: overrides.updatedAt ?? new Date(),
		createdBy: overrides.createdBy ?? 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
	}
}

function mockUser(): User {
	return {
		id: 'f1e2d3c4-b5a6-9876-5432-10fedcba9876',
		app_metadata: {},
		user_metadata: {},
		aud: 'authenticated',
		created_at: new Date().toISOString(),
		email: 'user@example.com',
	} as unknown as User
}

describe('queryProcessesAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(userAuthAction).mockResolvedValue({
			success: true,
			data: mockUser(),
			error: null,
		})

		const defaultRepo = mockRepo()
		vi.mocked(defaultRepo.findMany).mockResolvedValue({ data: [], total: 0 })
		vi.mocked(getProcessRepository).mockReturnValue(defaultRepo)
	})

	describe('Input Validation', () => {
		it('should fail with empty spaceId', async () => {
			const result = await queryProcessesAction({
				spaceId: '',
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
			expect(result.message).toBeDefined()
		})

		it('should fail with pageSize > 100', async () => {
			const result = await queryProcessesAction({
				spaceId: 'space-1',
				pageSize: 101,
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
		})

		it('should fail with pageSize < 1', async () => {
			const result = await queryProcessesAction({
				spaceId: 'space-1',
				pageSize: 0,
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
		})

		it('should fail with negative pageSize', async () => {
			const result = await queryProcessesAction({
				spaceId: 'space-1',
				pageSize: -5,
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
		})

		it('should fail with invalid sortDirection', async () => {
			const result = await queryProcessesAction({
				spaceId: 'space-1',
				sortDirection: 'invalid' as unknown as 'asc' | 'desc',
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
		})

		it('should fail with invalid sortBy', async () => {
			const result = await queryProcessesAction({
				spaceId: 'space-1',
				sortBy: 'title' as unknown as 'createdAt',
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
		})

		it('should fail with invalid status', async () => {
			const result = await queryProcessesAction({
				spaceId: 'space-1',
				status: 'INVALID' as unknown as
					| 'PENDING'
					| 'ACTIVE'
					| 'SUSPENDED'
					| 'ARCHIVED'
					| 'CLOSED',
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
		})

		it('should accept valid sortDirection values', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			const resultAsc = await queryProcessesAction({
				spaceId: 'space-1',
				sortDirection: 'asc',
			})

			const resultDesc = await queryProcessesAction({
				spaceId: 'space-1',
				sortDirection: 'desc',
			})

			expect(resultAsc.success).toBe(true)
			expect(resultDesc.success).toBe(true)
		})

		it('should accept all valid status values', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			const statuses = [
				'PENDING',
				'ACTIVE',
				'SUSPENDED',
				'ARCHIVED',
				'CLOSED',
			] as const

			for (const status of statuses) {
				const result = await queryProcessesAction({
					spaceId: 'space-1',
					status,
				})
				expect(result.success).toBe(true)
			}
		})
	})

	describe('Authentication', () => {
		it('should fail when user is not authenticated', async () => {
			vi.mocked(userAuthAction).mockResolvedValue({
				success: false,
				data: null,
				error: null,
			})

			const result = await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(result.success).toBe(false)
			expect(result.message).toMatch(/Usuário não autenticado/)
			expect(result.data).toBeNull()
			expect(getProcessRepository).not.toHaveBeenCalled()
		})

		it('should propagate authentication error', async () => {
			const authError = new Error(
				'Auth failed',
			) as unknown as import('@supabase/supabase-js').AuthError
			vi.mocked(userAuthAction).mockResolvedValue({
				success: false,
				data: null,
				error: authError,
			})

			const result = await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(result.success).toBe(false)
			expect(result.error).toBe(authError)
			expect(result.data).toBeNull()
		})
	})

	describe('Basic Search', () => {
		it('should return empty list when no processes found', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			const result = await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(result.success).toBe(true)
			expect(result.data?.rows).toEqual([])
			expect(result.data?.total).toBe(0)
		})

		it('should return list of processes', async () => {
			const processes = [
				makeProcess('550e8400-e29b-41d4-a716-446655440000'),
				makeProcess('550e8400-e29b-41d4-a716-446655440001'),
			]

			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({
				data: processes,
				total: processes.length,
			})
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			const result = await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(result.success).toBe(true)
			expect(result.data?.rows).toHaveLength(2)
			expect(result.data?.total).toBe(2)
			expect(result.data?.rows[0].id).toBe(
				'550e8400-e29b-41d4-a716-446655440000',
			)
		})

		it('should use default values for page and pageSize', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(repo.findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 1,
				pageSize: 10,
				searchQuery: undefined,
				sortBy: undefined,
				sortDirection: undefined,
				status: undefined,
			})
		})
	})

	describe('Pagination', () => {
		it('should handle first page correctly', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			await queryProcessesAction({
				spaceId: 'space-1',
				page: 1,
				pageSize: 10,
			})

			expect(repo.findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 1,
				pageSize: 10,
				searchQuery: undefined,
				sortBy: undefined,
				sortDirection: undefined,
				status: undefined,
			})
		})

		it('should handle second page correctly', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			await queryProcessesAction({
				spaceId: 'space-1',
				page: 2,
				pageSize: 10,
			})

			expect(repo.findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 2,
				pageSize: 10,
				searchQuery: undefined,
				sortBy: undefined,
				sortDirection: undefined,
				status: undefined,
			})
		})

		it('should handle last page with fewer records', async () => {
			const processes = [makeProcess('550e8400-e29b-41d4-a716-446655440000')]

			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({
				data: processes,
				total: 11, // Total is 11, but last page only has 1
			})
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			const result = await queryProcessesAction({
				spaceId: 'space-1',
				page: 2,
				pageSize: 10,
			})

			expect(result.success).toBe(true)
			expect(result.data?.rows).toHaveLength(1)
			expect(result.data?.total).toBe(11)
		})

		it('should handle custom pageSize', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			await queryProcessesAction({
				spaceId: 'space-1',
				pageSize: 50,
			})

			expect(repo.findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 1,
				pageSize: 50,
				searchQuery: undefined,
				sortBy: undefined,
				sortDirection: undefined,
				status: undefined,
			})
		})
	})

	describe('Filters', () => {
		beforeEach(() => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
		})

		it('should filter by searchQuery', async () => {
			const repo = mockRepo()
			const processes = [
				makeProcess('550e8400-e29b-41d4-a716-446655440000', {
					title: 'Contract Dispute Case',
				}),
			]
			vi.mocked(repo.findMany).mockResolvedValue({
				data: processes,
				total: 1,
			})
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			const result = await queryProcessesAction({
				spaceId: 'space-1',
				searchQuery: 'Contract',
			})

			expect(result.success).toBe(true)
			expect(result.data?.rows[0].title).toContain('Contract')
			expect(repo.findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 1,
				pageSize: 10,
				searchQuery: 'Contract',
				sortBy: undefined,
				sortDirection: undefined,
				status: undefined,
			})
		})

		it('should filter by status ACTIVE', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				status: 'ACTIVE',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'ACTIVE',
				}),
			)
		})

		it('should filter by status ARCHIVED', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				status: 'ARCHIVED',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'ARCHIVED',
				}),
			)
		})

		it('should filter by status PENDING', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				status: 'PENDING',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'PENDING',
				}),
			)
		})

		it('should filter by status SUSPENDED', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				status: 'SUSPENDED',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'SUSPENDED',
				}),
			)
		})

		it('should filter by status CLOSED', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				status: 'CLOSED',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'CLOSED',
				}),
			)
		})

		it('should combine searchQuery and status filters', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				searchQuery: 'Contract',
				status: 'ACTIVE',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 1,
				pageSize: 10,
				searchQuery: 'Contract',
				sortBy: undefined,
				sortDirection: undefined,
				status: 'ACTIVE',
			})
		})

		it('should handle empty searchQuery', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				searchQuery: '',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					searchQuery: '',
				}),
			)
		})

		it('should handle whitespace searchQuery', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				searchQuery: '   ',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					searchQuery: '   ',
				}),
			)
		})

		it('should handle special characters in searchQuery', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				searchQuery: "Process with 'quotes' and % symbols",
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					searchQuery: "Process with 'quotes' and % symbols",
				}),
			)
		})
	})

	describe('Sorting', () => {
		beforeEach(() => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
		})

		it('should sort by createdAt ascending', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				sortBy: 'createdAt',
				sortDirection: 'asc',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 1,
				pageSize: 10,
				searchQuery: undefined,
				sortBy: 'createdAt',
				sortDirection: 'asc',
				status: undefined,
			})
		})

		it('should sort by createdAt descending', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				sortBy: 'createdAt',
				sortDirection: 'desc',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 1,
				pageSize: 10,
				searchQuery: undefined,
				sortBy: 'createdAt',
				sortDirection: 'desc',
				status: undefined,
			})
		})

		it('should handle sortBy without sortDirection', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
				sortBy: 'createdAt',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					sortBy: 'createdAt',
					sortDirection: undefined,
				}),
			)
		})

		it('should use default sorting when not specified', async () => {
			await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(getProcessRepository().findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					sortBy: undefined,
					sortDirection: undefined,
				}),
			)
		})
	})

	describe('Output Validation', () => {
		it('should fail when repository returns invalid structure', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({
				invalid: 'data',
				structure: true,
			} as unknown as { data: Process[]; total: number })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			const result = await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
			expect(result.message).toBeDefined()
		})

		it('should fail when process data is incomplete', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({
				data: [{ id: 'incomplete' }],
				total: 1,
			} as unknown as { data: Process[]; total: number })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			const result = await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
		})

		it('should fail when total is not a number', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({
				data: [],
				total: 'not-a-number',
			} as unknown as { data: Process[]; total: number })
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			vi.mocked(userAuthAction).mockResolvedValue({
				success: true,
				data: mockUser(),
				error: null,
			})

			const result = await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeNull()
		})
	})

	describe('Edge Cases', () => {
		it('should handle non-existent page gracefully', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 10 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			const result = await queryProcessesAction({
				spaceId: 'space-1',
				page: 999,
			})

			expect(result.success).toBe(true)
			expect(result.data?.rows).toEqual([])
			expect(result.data?.total).toBe(10)
		})

		it('should handle maximum pageSize', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			const result = await queryProcessesAction({
				spaceId: 'space-1',
				pageSize: 100,
			})

			expect(result.success).toBe(true)
			expect(repo.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					pageSize: 100,
				}),
			)
		})

		it('should handle very large page numbers', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			const result = await queryProcessesAction({
				spaceId: 'space-1',
				page: 1000000,
			})

			expect(result.success).toBe(true)
			expect(repo.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					page: 1000000,
				}),
			)
		})

		it('should handle non-existent spaceId', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			const result = await queryProcessesAction({
				spaceId: 'non-existent-space',
			})

			expect(result.success).toBe(true)
			expect(result.data?.rows).toEqual([])
			expect(result.data?.total).toBe(0)
		})
	})

	describe('Repository Calls', () => {
		it('should call repository with correct parameters', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			await queryProcessesAction({
				spaceId: 'space-1',
				page: 2,
				pageSize: 25,
				searchQuery: 'test',
				sortBy: 'createdAt',
				sortDirection: 'desc',
				status: 'ACTIVE',
			})

			expect(repo.findMany).toHaveBeenCalledTimes(1)
			expect(repo.findMany).toHaveBeenCalledWith({
				spaceId: 'space-1',
				page: 2,
				pageSize: 25,
				searchQuery: 'test',
				sortBy: 'createdAt',
				sortDirection: 'desc',
				status: 'ACTIVE',
			})
		})

		it('should call userAuthAction exactly once', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(userAuthAction).toHaveBeenCalledTimes(1)
		})

		it('should call getProcessRepository exactly once', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
			vi.mocked(getProcessRepository).mockReturnValue(repo)

			await queryProcessesAction({
				spaceId: 'space-1',
			})

			expect(getProcessRepository).toHaveBeenCalledTimes(1)
		})
	})
})
