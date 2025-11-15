import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/account', () => ({
	makeAccountRepository: vi.fn(),
}))
vi.mock('@modules/process/factories', () => ({
	getProcessRepository: vi.fn(),
	makeProcessRepository: vi.fn(),
}))

const { userAuthAction } = await import(
	'@modules/auth/actions/user-auth.action'
)
const { makeAccountRepository } = await import('@modules/account')
const { getProcessRepository, makeProcessRepository } = await import(
	'@modules/process/factories'
)
const { insertProcessAction } = await import(
	'../mutations/insert-process.action'
)

import type { User } from '@supabase/supabase-js'

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
function mockAccount() {
	return { id: '22222222-2222-4222-8222-222222222222' }
}
function mockRepo() {
	return { insert: vi.fn() }
}
function mockAccountRepo() {
	return { findByUserId: vi.fn() }
}

describe('insertProcessAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(userAuthAction).mockResolvedValue({
			data: mockUser(),
			error: null,
			success: true,
		})
		const accountRepo = mockAccountRepo()
		vi.mocked(accountRepo.findByUserId).mockResolvedValue(mockAccount())
		vi.mocked(makeAccountRepository).mockReturnValue(
			accountRepo as unknown as ReturnType<typeof makeAccountRepository>,
		)
	})

	it('fails validation (invalid processNumber)', async () => {
		const result = await insertProcessAction({
			assignedId: '44444444-4444-4444-8444-444444444444',
			clientId: '33333333-3333-4333-8333-333333333333',
			description: 'Desc',
			processNumber: 'invalid-format',
			spaceId: 'space-123',
			status: 'ACTIVE',
			title: 'Ok',
		})
		expect(result.success).toBe(false)
		expect(result.data).toBeNull()
		expect(result.error).toBeDefined()
	})

	it('creates process successfully', async () => {
		const repo = mockRepo()
		vi.mocked(repo.insert).mockResolvedValue({
			processId: '55555555-5555-4555-8555-555555555555',
		})
		// insert action uses makeProcessRepository, so mock it
		vi.mocked(makeProcessRepository).mockReturnValue(
			repo as unknown as ReturnType<typeof makeProcessRepository>,
		)

		const result = await insertProcessAction({
			assignedId: '44444444-4444-4444-8444-444444444444',
			clientId: '33333333-3333-4333-8333-333333333333',
			description: 'Desc',
			processNumber: '1234567-89.1234.1.12.1234',
			spaceId: 'space-123',
			status: 'ACTIVE',
			title: 'New Process',
		})

		expect(result.success).toBe(true)
		expect(result.data).toBe('55555555-5555-4555-8555-555555555555')
		expect(repo.insert).toHaveBeenCalled()
	})

	it('fails when account not found', async () => {
		const accountRepo = mockAccountRepo()
		vi.mocked(accountRepo.findByUserId).mockResolvedValue(undefined)
		vi.mocked(makeAccountRepository).mockReturnValue(
			accountRepo as unknown as ReturnType<typeof makeAccountRepository>,
		)

		const result = await insertProcessAction({
			assignedId: '44444444-4444-4444-8444-444444444444',
			clientId: '33333333-3333-4333-8333-333333333333',
			description: 'Desc',
			processNumber: '1234567-89.1234.1.12.1234',
			spaceId: 'space-123',
			status: 'ACTIVE',
			title: 'New Process',
		})

		expect(result.success).toBe(false)
		expect(result.message).toMatch(/Conta do usuário não encontrada/)
	})
})
