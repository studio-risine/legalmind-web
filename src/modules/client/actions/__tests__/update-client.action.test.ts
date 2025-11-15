import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/client/factories', () => ({
	clientRepository: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const { userAuthAction } = await import(
	'@modules/auth/actions/user-auth.action'
)
const { clientRepository } = await import('@modules/client/factories')
const { revalidatePath } = await import('next/cache')
const { updateClientWithoutCacheAction: updateClientAction } = await import(
	'../mutations/update-client.action'
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

describe('updateClientAction', () => {
	beforeEach(() => vi.clearAllMocks())

	it('fails on invalid input (bad id)', async () => {
		const invalidInput = {
			data: { name: 'X' },
			id: 'not-a-uuid',
			spaceId: 'space-1',
		} as unknown as Parameters<typeof updateClientAction>[0]
		const result = await updateClientAction(invalidInput)
		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
	})

	it('fails if unauthenticated', async () => {
		vi.mocked(userAuthAction).mockResolvedValue({
			data: null,
			error: null,
			success: false,
		})
		vi.mocked(clientRepository).mockReturnValue(mockRepo())
		const result = await updateClientAction({
			data: { name: 'New' },
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Usuário não autenticado/)
	})

	it('updates and returns client id', async () => {
		const repo = mockRepo()
		vi.mocked(repo.update).mockResolvedValue({
			clientId: '550e8400-e29b-41d4-a716-446655440000',
		})
		vi.mocked(clientRepository).mockReturnValue(repo)
		vi.mocked(userAuthAction).mockResolvedValue({
			data: {
				aud: 'authenticated',
				created_at: new Date().toISOString(),
				id: 'acc-1',
			} as unknown as import('@supabase/supabase-js').User,
			error: null,
			success: true,
		})
		const result = await updateClientAction({
			data: { name: 'Changed' },
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(repo.update).toHaveBeenCalledWith({
			data: { name: 'Changed' },
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(result.success).toBe(true)
		expect(result.data).toBe('550e8400-e29b-41d4-a716-446655440000')
		expect(revalidatePath).toHaveBeenCalledWith('/space/space-1/clientes')
	})

	it('handles repository failure', async () => {
		const repo = mockRepo()
		vi.mocked(repo.update).mockResolvedValue({
			clientId: '',
		})
		vi.mocked(clientRepository).mockReturnValue(repo)
		vi.mocked(userAuthAction).mockResolvedValue({
			data: {
				aud: 'authenticated',
				created_at: new Date().toISOString(),
				id: 'acc-1',
			} as unknown as import('@supabase/supabase-js').User,
			error: null,
			success: true,
		})
		const result = await updateClientAction({
			data: { name: 'New name' },
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Ocorreu um erro ao atualizar/)
	})
})
