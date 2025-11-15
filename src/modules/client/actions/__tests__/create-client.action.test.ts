import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mocks
vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/client/factories', () => ({
	clientRepository: vi.fn(),
}))
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

const { userAuthAction } = await import(
	'@modules/auth/actions/user-auth.action'
)
const { clientRepository } = await import('@modules/client/factories')
const { revalidatePath } = await import('next/cache')
const { insertClientWithoutCacheAction: insertClientAction } = await import(
	'../mutations/insert-client.action'
)

import type { ClientRepository } from '../../repositories/client-repository'

function mockRepo(): ClientRepository {
	return {
		delete: vi.fn(),
		findById: vi.fn(),
		findMany: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
	}
}

describe('insertClientAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('fails on invalid input schema', async () => {
		const client = {
			documentNumber: '123',
			email: 'invalid-email',
			name: '',
			phoneNumber: '',
			status: 'ACTIVE',
			type: 'INDIVIDUAL',
		} as Parameters<typeof insertClientAction>[0]

		const result = await insertClientAction(client)
		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
	})

	it('fails if user not authenticated', async () => {
		class FakeAuthError extends Error {
			status = 401
			code = 'auth'
			constructor(message: string) {
				super(message)
				this.name = 'AuthError'
			}
		}
		const authError = new FakeAuthError(
			'auth',
		) as unknown as import('@supabase/supabase-js').AuthError
		vi.mocked(userAuthAction).mockResolvedValue({
			data: null,
			error: authError,
			success: false,
		})
		vi.mocked(clientRepository).mockReturnValue(mockRepo())

		const result = await insertClientAction({
			documentNumber: '12345678901',
			email: 'john@example.com',
			name: 'John Doe',
			phoneNumber: '123',
			spaceId: 'space-1',
			status: 'ACTIVE',
			type: 'INDIVIDUAL',
		})

		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Usuário não autenticado/)
	})

	it('calls repository and returns success', async () => {
		const repo = mockRepo()
		vi.mocked(repo.insert).mockResolvedValue({
			clientId: '550e8400-e29b-41d4-a716-446655440000',
		})
		vi.mocked(clientRepository).mockReturnValue(repo)
		const fakeUser = {
			aud: 'authenticated',
			created_at: new Date().toISOString(),
			email: 'user@example.com',
			id: 'user-1',
		}
		vi.mocked(userAuthAction).mockResolvedValue({
			data: fakeUser as unknown as import('@supabase/supabase-js').User,
			error: null,
			success: true,
		})

		const result = await insertClientAction({
			documentNumber: '12345678901',
			email: 'jane@example.com',
			name: 'Jane',
			phoneNumber: '123',
			spaceId: 'space-1',
			status: 'ACTIVE',
			type: 'INDIVIDUAL',
		})

		expect(repo.insert).toHaveBeenCalledWith({
			documentNumber: '12345678901',
			email: 'jane@example.com',
			name: 'Jane',
			phoneNumber: '123',
			spaceId: 'space-1',
			status: 'ACTIVE',
			type: 'INDIVIDUAL',
		})
		expect(result.success).toBe(true)
		expect(result.data).toBe('550e8400-e29b-41d4-a716-446655440000')
		expect(revalidatePath).toHaveBeenCalledWith('/space/space-1/clientes')
	})

	it('handles repository failure (missing id)', async () => {
		const repo = mockRepo()
		vi.mocked(repo.insert).mockResolvedValue({
			clientId: '',
		})
		vi.mocked(clientRepository).mockReturnValue(repo)

		const result = await insertClientAction({
			documentNumber: '12345678901',
			email: 'jane@example.com',
			name: 'Jane',
			phoneNumber: '123',
			spaceId: 'space-1',
			status: 'ACTIVE',
			type: 'INDIVIDUAL',
		})

		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Ocorreu um erro ao criar/)
	})
})
