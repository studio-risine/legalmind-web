import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/client/factories', () => ({
	clientRepository: vi.fn(),
}))

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
		delete: vi.fn(),
		findById: vi.fn(),
		findMany: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
	}
}

function makeClient(id: string, overrides: Partial<Client> = {}): Client {
	return {
		createdAt: overrides.createdAt ?? new Date(),
		deletedAt: overrides.deletedAt ?? null,
		documentNumber: overrides.documentNumber ?? '123456789',
		email: overrides.email ?? `${id.slice(0, 4)}@example.com`,
		id,
		name: overrides.name ?? `Client ${id.slice(0, 4)}`,
		phoneNumber: overrides.phoneNumber ?? null,
		spaceId: overrides.spaceId ?? 'space-1',
		status: overrides.status ?? 'ACTIVE',
		type: overrides.type ?? 'COMPANY',
		updatedAt: overrides.updatedAt ?? new Date(),
	}
}

describe('queryClientsAction', () => {
	beforeEach(() => vi.clearAllMocks())

	it('fails on invalid pagination', async () => {
		const result = await queryClientsAction({
			limit: 0,
			spaceId: 'space-1',
		})
		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
	})

	it('fails when unauthenticated', async () => {
		vi.mocked(userAuthAction).mockResolvedValue({
			data: null,
			error: null,
			success: false,
		})
		vi.mocked(clientRepository).mockReturnValue(mockRepo())
		const result = await queryClientsAction({
			spaceId: 'space-1',
		})
		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Usuário não autenticado/)
	})

	it('returns empty list', async () => {
		const repo = mockRepo()
		vi.mocked(repo.findMany).mockResolvedValue({
			data: [],
			total: 0,
		})
		vi.mocked(clientRepository).mockReturnValue(repo)
		vi.mocked(userAuthAction).mockResolvedValue({
			data: {
				app_metadata: {},
				aud: 'authenticated',
				created_at: new Date().toISOString(),
				id: 'user-1',
				user_metadata: {},
			} as unknown as User,
			error: null,
			success: true,
		})
		const result = await queryClientsAction({
			limit: 10,
			offset: 0,
			spaceId: 'space-1',
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
			makeClient('550e8400-e29b-41d4-a716-446655440001', {
				name: 'Beta LLC',
			}),
		]
		vi.mocked(repo.findMany).mockResolvedValue({
			data: clients,
			total: clients.length,
		})
		vi.mocked(clientRepository).mockReturnValue(repo)
		vi.mocked(userAuthAction).mockResolvedValue({
			data: {
				app_metadata: {},
				aud: 'authenticated',
				created_at: new Date().toISOString(),
				id: 'user-1',
				user_metadata: {},
			} as unknown as User,
			error: null,
			success: true,
		})
		const result = await queryClientsAction({
			limit: 10,
			search: 'Alpha',
			spaceId: 'space-1',
			status: 'ACTIVE',
		})
		expect(result.success).toBe(true)
		expect(result.data?.clients).toEqual(clients)
		expect(result.data?.total).toBe(clients.length)
		expect(repo.findMany).toHaveBeenCalledWith({
			limit: 10,
			search: 'Alpha',
			spaceId: 'space-1',
			status: 'ACTIVE',
		})
	})
})
