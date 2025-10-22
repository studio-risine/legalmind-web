import { getSpaceByIdAction } from '@modules/space/actions/get-space-by-id-action'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSpace = {
	id: 'space-123',
	name: 'Test Space',
	created_by: 'user-account-id',
	created_at: new Date('2025-10-22T15:41:35.912Z'),
	updated_at: new Date('2025-10-22T15:41:35.912Z'),
	deleted_at: null,
}

vi.mock('@infra/db', () => ({
	db: {
		query: {
			spaces: {
				findFirst: vi.fn(),
			},
		},
	},
}))

vi.mock('@modules/account/utils/get-current-account', () => ({
	getCurrentAccountId: vi.fn(),
}))

describe('Get Space By ID Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should return space when found and user has access', async () => {
			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			const { db } = await import('@infra/db')

			vi.mocked(getCurrentAccountId).mockResolvedValue('user-account-id')
			vi.mocked(db.query.spaces.findFirst).mockResolvedValue(mockSpace)

			const result = await getSpaceByIdAction({ id: 'space-123' })

			expect(result).toEqual(mockSpace)
		})
	})

	describe('Negative Scenarios', () => {
		it('should return null when input validation fails', async () => {
			const result = await getSpaceByIdAction({ id: '' })
			expect(result).toBeNull()
		})

		it('should return null when no account context', async () => {
			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(null)

			const result = await getSpaceByIdAction({ id: 'space-123' })
			expect(result).toBeNull()
		})

		it('should return null when space not found', async () => {
			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			const { db } = await import('@infra/db')

			vi.mocked(getCurrentAccountId).mockResolvedValue('user-account-id')
			vi.mocked(db.query.spaces.findFirst).mockResolvedValue(undefined)

			const result = await getSpaceByIdAction({ id: 'space-123' })
			expect(result).toBeNull()
		})

		it('should return null when database query fails', async () => {
			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			const { db } = await import('@infra/db')

			vi.mocked(getCurrentAccountId).mockResolvedValue('user-account-id')
			vi.mocked(db.query.spaces.findFirst).mockRejectedValue(
				new Error('Database connection failed'),
			)

			const result = await getSpaceByIdAction({ id: 'space-123' })
			expect(result).toBeNull()
		})
	})

	describe('Edge Cases', () => {
		it('should handle malformed space data gracefully', async () => {
			const malformedSpace = {
				id: 'space-123',
				created_by: 'user-account-id',
			}
			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			const { db } = await import('@infra/db')

			vi.mocked(getCurrentAccountId).mockResolvedValue('user-account-id')
			vi.mocked(db.query.spaces.findFirst).mockResolvedValue(
				malformedSpace as any,
			)

			const result = await getSpaceByIdAction({ id: 'space-123' })
			expect(result).toBeNull()
		})
	})
})
