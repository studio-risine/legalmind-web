import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteSpaceAction } from '../delete-space-action'

// Mock dependencies
vi.mock('@infra/db', () => ({
	db: {
		select: vi.fn(),
		update: vi.fn(),
	},
}))

vi.mock('@modules/account/utils/get-current-account', () => ({
	getCurrentAccountId: vi.fn(),
}))

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

describe('Delete Space Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should delete space successfully with valid data', async () => {
			// Arrange
			const input = { id: 'space-123' }
			const accountId = 'account-123'

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')

			// Mock space existence check
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([{ id: 'space-123' }]),
						}),
					}),
				}),
			})

			// Mock delete operation (soft delete)
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.update) as any).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([{ id: 'space-123' }]),
					}),
				}),
			})

			const { revalidatePath } = await import('next/cache')

			// Act
			const result = await deleteSpaceAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.error).toBeUndefined()
			expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/dashboard')
		})
	})

	describe('Negative Scenarios', () => {
		it('should return error if input validation fails', async () => {
			// Arrange
			const input = { id: '' } // Invalid: empty id

			// Act
			const result = await deleteSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
		})

		it('should return error if no account context', async () => {
			// Arrange
			const input = { id: 'space-123' }

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(null)

			// Act
			const result = await deleteSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('No account found.')
		})

		it('should return error if space not found or access denied', async () => {
			// Arrange
			const input = { id: 'nonexistent-space' }
			const accountId = 'account-123'

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')

			// Mock space existence check - no space found
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([]), // No results
						}),
					}),
				}),
			})

			// Act
			const result = await deleteSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Space not found or access denied.')
		})

		it('should return error if delete operation fails', async () => {
			// Arrange
			const input = { id: 'space-123' }
			const accountId = 'account-123'

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')

			// Mock space existence check - space exists
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([{ id: 'space-123' }]),
						}),
					}),
				}),
			})

			// Mock delete operation - no rows returned
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.update) as any).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([]), // No deleted rows
					}),
				}),
			})

			// Act
			const result = await deleteSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Failed to delete space.')
		})

		it('should return error if database operation fails', async () => {
			// Arrange
			const input = { id: 'space-123' }
			const accountId = 'account-123'

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')

			// Mock space existence check to throw error
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi
								.fn()
								.mockRejectedValue(new Error('Database connection failed')),
						}),
					}),
				}),
			})

			// Act
			const result = await deleteSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Database connection failed')
		})
	})

	describe('Edge Cases', () => {
		it('should handle concurrent deletion attempts gracefully', async () => {
			// Arrange
			const input = { id: 'space-123' }
			const accountId = 'account-123'

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')

			// Mock space existence check - space exists
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.select) as any).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([{ id: 'space-123' }]),
						}),
					}),
				}),
			})

			// Mock delete operation succeeds
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.update) as any).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([{ id: 'space-123' }]),
					}),
				}),
			})

			// Act
			const result = await deleteSpaceAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.error).toBeUndefined()
		})
	})
})
