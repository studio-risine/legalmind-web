import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/process/factories', () => ({
	getProcessRepository: vi.fn(),
}))
vi.mock('@modules/space/http/get-space-id-headers', () => ({
	getSpaceIdFromHeaders: vi.fn(),
}))
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

const { userAuthAction } = await import(
	'@modules/auth/actions/user-auth.action'
)
const { getProcessRepository } = await import('@modules/process/factories')
const { getSpaceIdFromHeaders } = await import(
	'@modules/space/http/get-space-id-headers'
)
const { deleteProcessAction } = await import(
	'../mutations/delete-process.action'
)

import type { AuthError, User } from '@supabase/supabase-js'

function mockUser(): User {
	return {
		app_metadata: {},
		aud: 'authenticated',
		created_at: new Date().toISOString(),
		email: 'user@example.com',
		id: '11111111-1111-4111-8111-111111111111',
		user_metadata: {},
	} as unknown as User
}

function mockRepo() {
	return { delete: vi.fn() }
}

describe('deleteProcessAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(userAuthAction).mockResolvedValue({
			data: mockUser(),
			error: null,
			success: true,
		})
		vi.mocked(getSpaceIdFromHeaders).mockResolvedValue('space-1')
	})

	it('fails validation (invalid id)', async () => {
		const invalidInput = {
			id: 'not-uuid',
			spaceId: 'space-1',
		} as unknown as Parameters<typeof deleteProcessAction>[0]
		const result = await deleteProcessAction(invalidInput)
		expect(result.success).toBe(false)
		expect(result.data).toBeNull()
	})

	it('fails when user is not authenticated', async () => {
		vi.mocked(userAuthAction).mockResolvedValue({
			data: null,
			error: { message: 'Unauthorized' } as AuthError,
			success: false,
		})

		const result = await deleteProcessAction({
			id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
		})

		expect(result.success).toBe(false)
		expect(result.data).toBeNull()
		expect(result.message).toBe('Usuário não autenticado')
	})

	it('fails when space ID is not found', async () => {
		vi.mocked(getSpaceIdFromHeaders).mockResolvedValue(null)

		const result = await deleteProcessAction({
			id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
		})

		expect(result.success).toBe(false)
		expect(result.data).toBeNull()
		expect(result.message).toBe('Space ID não encontrado nos headers')
	})

	it('deletes successfully', async () => {
		const repo = mockRepo()
		vi.mocked(getProcessRepository).mockReturnValue(
			repo as unknown as ReturnType<typeof getProcessRepository>,
		)

		const result = await deleteProcessAction({
			id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
		})

		expect(result.success).toBe(true)
		expect(result.data).toBeNull()
		expect(result.message).toBe('Processo excluído com sucesso!')
		expect(repo.delete).toHaveBeenCalledWith({
			id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
			spaceId: 'space-1',
		})
	})
})
