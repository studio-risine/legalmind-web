import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listSpacesAction } from '../list-spaces-action'

// Mock dependencies
vi.mock('@infra/db', () => ({
	db: {
		select: vi.fn(),
	},
}))

vi.mock('@modules/account/utils/get-current-account', () => ({
	getCurrentAccountId: vi.fn(),
}))

describe('List Spaces Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should return list of spaces for authenticated user', async () => {
			// Arrange
			const accountId = 'account-123'
			const mockSpaces = [
				{
					id: 'space-1',
					name: 'Space One',
					created_at: new Date('2024-01-01'),
					updated_at: new Date('2024-01-01'),
					deleted_at: null,
				},
				{
					id: 'space-2',
					name: 'Space Two',
					created_at: new Date('2024-01-02'),
					updated_at: new Date('2024-01-02'),
					deleted_at: null,
				},
			]

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							orderBy: vi
								.fn()
								.mockResolvedValue(
									mockSpaces.map((space) => ({ spaces: space })),
								),
						}),
					}),
				}),
			})

			// Act
			const result = await listSpacesAction()

			// Assert
			expect(result).toHaveLength(2)
			expect(result[0]).toEqual(mockSpaces[0])
			expect(result[1]).toEqual(mockSpaces[1])
		})

		it('should return empty array when user has no spaces', async () => {
			// Arrange
			const accountId = 'account-123'

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							orderBy: vi.fn().mockResolvedValue([]), // No spaces
						}),
					}),
				}),
			})

			// Act
			const result = await listSpacesAction()

			// Assert
			expect(result).toEqual([])
		})
	})

	describe('Negative Scenarios', () => {
		it('should return empty array when no account context', async () => {
			// Arrange
			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(null)

			// Act
			const result = await listSpacesAction()

			// Assert
			expect(result).toEqual([])
		})

		it('should return empty array when database query fails', async () => {
			// Arrange
			const accountId = 'account-123'

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							orderBy: vi
								.fn()
								.mockRejectedValue(new Error('Database connection failed')),
						}),
					}),
				}),
			})

			// Act
			const result = await listSpacesAction()

			// Assert
			expect(result).toEqual([])
		})
	})

	describe('Edge Cases', () => {
		it('should handle malformed space data gracefully', async () => {
			// Arrange
			const accountId = 'account-123'
			const malformedSpaces = [
				{
					id: 'space-1',
					// Missing required fields like created_at
					name: 'Space One',
				},
			]

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							orderBy: vi
								.fn()
								.mockResolvedValue(
									malformedSpaces.map((space) => ({ spaces: space })),
								),
						}),
					}),
				}),
			})

			// Act
			const result = await listSpacesAction()

			// Assert
			expect(result).toEqual([]) // Should handle parsing errors gracefully
		})
	})
})
