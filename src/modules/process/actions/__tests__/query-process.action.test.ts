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
const { queryProcessWithoutCacheAction: queryProcessAction } = await import(
	'../queries/query-process.action'
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

describe('queryProcessAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(userAuthAction).mockResolvedValue({
			success: true,
			data: mockUser(),
			error: null,
		})
		const defaultRepo = mockRepo()
		vi.mocked(defaultRepo.findById).mockResolvedValue(undefined)
		vi.mocked(getProcessRepository).mockReturnValue(defaultRepo)
	})

	describe('Input Validation', () => {
		it('should fail with invalid id format', async () => {
			const result = await queryProcessAction({
				id: 'not-a-uuid',
				spaceId: 'space-1',
			})
			expect(result.success).toBe(false)
			expect(result.data).toBeNull()
			expect(result.error).toBeDefined()
		})

		it('should fail with empty spaceId', async () => {
			const result = await queryProcessAction({
				id: '550e8400-e29b-41d4-a716-446655440000',
				spaceId: '',
			})
			expect(result.success).toBe(false)
			expect(result.data).toBeNull()
			expect(result.error).toBeDefined()
		})
	})

	describe('Authentication', () => {
		it('should fail when user not authenticated', async () => {
			vi.mocked(userAuthAction).mockResolvedValue({
				success: false,
				data: null,
				error: null,
			})
			const result = await queryProcessAction({
				id: '550e8400-e29b-41d4-a716-446655440000',
				spaceId: 'space-1',
			})
			expect(result.success).toBe(false)
			expect(result.message).toMatch(/Usuário não autenticado/)
			expect(result.data).toBeNull()
		})
	})

	describe('Not Found', () => {
		it('should return not found when repository returns undefined', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findById).mockResolvedValue(undefined)
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			const result = await queryProcessAction({
				id: '550e8400-e29b-41d4-a716-446655440000',
				spaceId: 'space-1',
			})
			expect(result.success).toBe(false)
			expect(result.message).toMatch(/não encontrado/i)
			expect(result.data).toBeNull()
		})
	})

	describe('Success', () => {
		it('should return a process row when found', async () => {
			const process = makeProcess('550e8400-e29b-41d4-a716-446655440000')
			const repo = mockRepo()
			vi.mocked(repo.findById).mockResolvedValue(process)
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			const result = await queryProcessAction({
				id: process.id,
				spaceId: process.spaceId,
			})
			expect(result.success).toBe(true)
			expect(result.data?.row.id).toBe(process.id)
		})
	})

	describe('Output Validation', () => {
		it('should fail if returned process is invalid', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findById).mockResolvedValue({
				id: 'incomplete',
			} as unknown as Process)
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			const result = await queryProcessAction({
				id: '550e8400-e29b-41d4-a716-446655440000',
				spaceId: 'space-1',
			})
			expect(result.success).toBe(false)
			expect(result.data).toBeNull()
			expect(result.error).toBeDefined()
		})
	})

	describe('Repository Calls', () => {
		it('should call repository with correct params', async () => {
			const repo = mockRepo()
			vi.mocked(repo.findById).mockResolvedValue(
				makeProcess('550e8400-e29b-41d4-a716-446655440000'),
			)
			vi.mocked(getProcessRepository).mockReturnValue(repo)
			await queryProcessAction({
				id: '550e8400-e29b-41d4-a716-446655440000',
				spaceId: 'space-1',
			})
			expect(repo.findById).toHaveBeenCalledTimes(1)
			expect(repo.findById).toHaveBeenCalledWith({
				id: '550e8400-e29b-41d4-a716-446655440000',
				spaceId: 'space-1',
			})
		})

		it('should call userAuthAction exactly once', async () => {
			await queryProcessAction({
				id: '550e8400-e29b-41d4-a716-446655440000',
				spaceId: 'space-1',
			})
			expect(userAuthAction).toHaveBeenCalledTimes(1)
		})
	})
})
