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
		insert: vi.fn(),
		findById: vi.fn(),
		findMany: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	}
}

describe('insertClientAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('fails on invalid input schema', async () => {
		const client = {
			name: '',
			email: 'invalid-email',
			phoneNumber: '',
			type: 'INDIVIDUAL',
			documentNumber: '123',
			status: 'ACTIVE',
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
			success: false,
			data: null,
			error: authError,
		})
		vi.mocked(clientRepository).mockReturnValue(mockRepo())

		const result = await insertClientAction({
			spaceId: 'space-1',
			name: 'John Doe',
			email: 'john@example.com',
			phoneNumber: '123',
			type: 'INDIVIDUAL',
			documentNumber: '12345678901',
			status: 'ACTIVE',
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
			id: 'user-1',
			aud: 'authenticated',
			created_at: new Date().toISOString(),
			email: 'user@example.com',
		}
		vi.mocked(userAuthAction).mockResolvedValue({
			success: true,
			data: fakeUser as unknown as import('@supabase/supabase-js').User,
			error: null,
		})

		const result = await insertClientAction({
			spaceId: 'space-1',
			name: 'Jane',
			email: 'jane@example.com',
			phoneNumber: '123',
			type: 'INDIVIDUAL',
			documentNumber: '12345678901',
			status: 'ACTIVE',
		})

		expect(repo.insert).toHaveBeenCalledWith({
			spaceId: 'space-1',
			name: 'Jane',
			email: 'jane@example.com',
			phoneNumber: '123',
			type: 'INDIVIDUAL',
			documentNumber: '12345678901',
			status: 'ACTIVE',
		})
		expect(result.success).toBe(true)
		expect(result.data).toBe('550e8400-e29b-41d4-a716-446655440000')
		expect(revalidatePath).toHaveBeenCalledWith('/space/space-1/clientes')
	})

	it('handles repository failure (missing id)', async () => {
		const repo = mockRepo()
		vi.mocked(repo.insert).mockResolvedValue({ clientId: '' })
		vi.mocked(clientRepository).mockReturnValue(repo)

		const result = await insertClientAction({
			spaceId: 'space-1',
			name: 'Jane',
			email: 'jane@example.com',
			phoneNumber: '123',
			type: 'INDIVIDUAL',
			documentNumber: '12345678901',
			status: 'ACTIVE',
		})

		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Ocorreu um erro ao criar/)
	})
})
