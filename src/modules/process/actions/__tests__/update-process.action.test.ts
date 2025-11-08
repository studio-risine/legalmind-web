import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@modules/auth/actions/user-auth.action', () => ({
	userAuthAction: vi.fn(),
}))
vi.mock('@modules/process/factories', () => ({ getProcessRepository: vi.fn() }))

const { userAuthAction } = await import(
	'@modules/auth/actions/user-auth.action'
)
const { getProcessRepository } = await import('@modules/process/factories')
const { updateProcessAction } = await import(
	'../mutations/update-process.action'
)

import type { User } from '@supabase/supabase-js'

function mockUser(): User {
	return {
		id: '11111111-1111-4111-8111-111111111111',
		app_metadata: {},
		user_metadata: {},
		aud: 'authenticated',
		created_at: new Date().toISOString(),
		email: 'user@example.com',
	} as unknown as User
}

function mockRepo() {
	return { update: vi.fn() }
}

describe('updateProcessAction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(userAuthAction).mockResolvedValue({
			success: true,
			data: mockUser(),
			error: null,
		})
	})

	it('fails validation (invalid id)', async () => {
		const invalidInput = {
			id: 'not-uuid',
			spaceId: 'space-1',
			data: { title: 'Updated' },
		} as unknown as Parameters<typeof updateProcessAction>[0]
		const result = await updateProcessAction(invalidInput)

		expect(result.success).toBe(false)
		expect(result.data).toBeNull()
	})

	it('updates successfully', async () => {
		const repo = mockRepo()
		vi.mocked(repo.update).mockResolvedValue({
			processId: '55555555-5555-4555-8555-555555555555',
		})
		vi.mocked(getProcessRepository).mockReturnValue(
			repo as unknown as ReturnType<typeof getProcessRepository>,
		)

		const result = await updateProcessAction({
			id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
			spaceId: 'space-1',
			data: { title: 'Updated' },
		})

		expect(result.success).toBe(true)
		expect(result.data).toBe('55555555-5555-4555-8555-555555555555')
	})
})
