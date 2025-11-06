import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/client/factories', () => ({ clientRepository: vi.fn() }))
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
		insert: vi.fn(),
		findById: vi.fn(),
		findMany: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	}
}

describe('updateClientAction', () => {
	beforeEach(() => vi.clearAllMocks())

	it('fails on invalid input (bad id)', async () => {
		const invalidInput = {
			id: 'not-a-uuid',
			spaceId: 'space-1',
			data: { name: 'X' },
		} as unknown as Parameters<typeof updateClientAction>[0]
		const result = await updateClientAction(invalidInput)
		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
	})

	it('fails if unauthenticated', async () => {
		vi.mocked(userAuthAction).mockResolvedValue({
			success: false,
			data: null,
			error: null,
		})
		vi.mocked(clientRepository).mockReturnValue(mockRepo())
		const result = await updateClientAction({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
			data: { name: 'New' },
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
			success: true,
			data: {
				id: 'acc-1',
				aud: 'authenticated',
				created_at: new Date().toISOString(),
			} as unknown as import('@supabase/supabase-js').User,
			error: null,
		})
		const result = await updateClientAction({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
			data: { name: 'Changed' },
		})
		expect(repo.update).toHaveBeenCalledWith({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
			data: { name: 'Changed' },
		})
		expect(result.success).toBe(true)
		expect(result.data).toBe('550e8400-e29b-41d4-a716-446655440000')
		expect(revalidatePath).toHaveBeenCalledWith('/space/space-1/clientes')
	})

	it('handles repository failure', async () => {
		const repo = mockRepo()
		vi.mocked(repo.update).mockResolvedValue({ clientId: '' })
		vi.mocked(clientRepository).mockReturnValue(repo)
		vi.mocked(userAuthAction).mockResolvedValue({
			success: true,
			data: {
				id: 'acc-1',
				aud: 'authenticated',
				created_at: new Date().toISOString(),
			} as unknown as import('@supabase/supabase-js').User,
			error: null,
		})
		const result = await updateClientAction({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
			data: { name: 'New name' },
		})
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Ocorreu um erro ao atualizar/)
	})
})
