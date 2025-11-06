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
const { deleteClientWithoutCacheAction: deleteClientAction } = await import(
	'../mutations/delete-client.action'
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

describe('deleteClientAction', () => {
	beforeEach(() => vi.clearAllMocks())

	it('fails on invalid id', async () => {
		const invalidInput = { id: 'bad-id', spaceId: 'space-1' } as unknown as {
			id: string
			spaceId: string
		}
		const result = await deleteClientAction(invalidInput)
		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
	})

	it('fails when unauthenticated', async () => {
		vi.mocked(userAuthAction).mockResolvedValue({
			success: false,
			data: null,
			error: null,
		})
		vi.mocked(clientRepository).mockReturnValue(mockRepo())
		const result = await deleteClientAction({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Usuário não autenticado/)
	})

	it('deletes successfully', async () => {
		const repo = mockRepo()
		vi.mocked(repo.delete).mockResolvedValue(undefined)
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
		const result = await deleteClientAction({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(repo.delete).toHaveBeenCalledWith({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(result.success).toBe(true)
		expect(revalidatePath).toHaveBeenCalledWith('/space/space-1/clientes')
	})
})
