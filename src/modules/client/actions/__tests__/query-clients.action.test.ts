import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/client/factories', () => ({ clientRepository: vi.fn() }))

const { userAuthAction } = await import(
	'@modules/auth/actions/user-auth.action'
)
const { clientRepository } = await import('@modules/client/factories')
const { queryClientsWithoutCacheAction: queryClientsAction } = await import(
	'../queries/query-clients.action'
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

function makeClient(id: string, overrides: Partial<Client> = {}): Client {
	return {
		id,
		spaceId: overrides.spaceId ?? 'space-1',
		name: overrides.name ?? `Client ${id.slice(0, 4)}`,
		email: overrides.email ?? `${id.slice(0, 4)}@example.com`,
		phoneNumber: overrides.phoneNumber ?? null,
		documentNumber: overrides.documentNumber ?? '123456789',
		status: overrides.status ?? 'ACTIVE',
		type: overrides.type ?? 'COMPANY',
		createdAt: overrides.createdAt ?? new Date(),
		updatedAt: overrides.updatedAt ?? new Date(),
		deletedAt: overrides.deletedAt ?? null,
	}
}

describe('queryClientsAction', () => {
	beforeEach(() => vi.clearAllMocks())

	it('fails on invalid pagination', async () => {
		const result = await queryClientsAction({ spaceId: 'space-1', limit: 0 })
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
		const result = await queryClientsAction({ spaceId: 'space-1' })
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Usuário não autenticado/)
	})

	it('returns empty list', async () => {
		const repo = mockRepo()
		vi.mocked(repo.findMany).mockResolvedValue({ data: [], total: 0 })
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
		const result = await queryClientsAction({
			spaceId: 'space-1',
			limit: 10,
			offset: 0,
		})
		expect(result.success).toBe(true)
		expect(result.data?.clients).toHaveLength(0)
		expect(result.data?.total).toBe(0)
	})

	it('returns filtered list', async () => {
		const repo = mockRepo()
		const clients: Client[] = [
			makeClient('550e8400-e29b-41d4-a716-446655440000', {
				name: 'Alpha Corp',
			}),
			makeClient('550e8400-e29b-41d4-a716-446655440001', { name: 'Beta LLC' }),
		]
		vi.mocked(repo.findMany).mockResolvedValue({
			data: clients,
			total: clients.length,
		})
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
		const result = await queryClientsAction({
			spaceId: 'space-1',
			search: 'Alpha',
			status: 'ACTIVE',
			limit: 10,
		})
		expect(result.success).toBe(true)
		expect(result.data?.clients).toEqual(clients)
		expect(result.data?.total).toBe(clients.length)
		expect(repo.findMany).toHaveBeenCalledWith({
			spaceId: 'space-1',
			search: 'Alpha',
			status: 'ACTIVE',
			limit: 10,
		})
	})
})
