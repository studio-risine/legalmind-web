import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/client/factories', () => ({ clientRepository: vi.fn() }))

const { userAuthAction } = await import(
	'@modules/auth/actions/user-auth.action'
)
const { clientRepository } = await import('@modules/client/factories')

const { queryClientByIdWithoutCacheAction: getClientByIdAction } = await import(
	'../queries/query-client-by-id.action'
)

import type { Client } from '@infra/db/schemas'
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

describe('getClientByIdAction', () => {
	beforeEach(() => vi.clearAllMocks())

	it('fails on invalid id', async () => {
		const result = await getClientByIdAction({
			id: 'bad-id',
			spaceId: 'space-1',
		} as unknown as { id: string; spaceId: string })
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
		const result = await getClientByIdAction({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Usuário não autenticado/)
	})

	it('returns not found when repository returns undefined', async () => {
		const repo = mockRepo()
		vi.mocked(repo.findById).mockResolvedValue(undefined)
		vi.mocked(clientRepository).mockReturnValue(repo)
		vi.mocked(userAuthAction).mockResolvedValue({
			success: true,
			data: {
				id: 'user-1',
				app_metadata: {},
				user_metadata: {},
				aud: 'authenticated',
				created_at: new Date().toISOString(),
			} as unknown as User,
			error: null,
		})
		const result = await getClientByIdAction({
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
		})
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Cliente não encontrado/)
	})

	it('returns client successfully', async () => {
		const repo = mockRepo()
		const client: Client = {
			id: '550e8400-e29b-41d4-a716-446655440000',
			spaceId: 'space-1',
			name: 'Acme',
			email: 'a@b.com',
			phoneNumber: null,
			documentNumber: '123',
			status: 'ACTIVE',
			type: 'COMPANY',
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null,
		}
		vi.mocked(repo.findById).mockResolvedValue(client)
		vi.mocked(clientRepository).mockReturnValue(repo)
		vi.mocked(userAuthAction).mockResolvedValue({
			success: true,
			data: {
				id: 'user-1',
				app_metadata: {},
				user_metadata: {},
				aud: 'authenticated',
				created_at: new Date().toISOString(),
			} as unknown as User,
			error: null,
		})
		const result = await getClientByIdAction({
			id: client.id,
			spaceId: client.spaceId,
		})
		expect(result.success).toBe(true)
		expect(result.data).toEqual(client)
	})
})
