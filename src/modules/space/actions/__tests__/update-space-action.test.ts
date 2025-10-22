import { beforeEach, describe, expect, it, vi } from 'vitest'
import { updateSpaceAction } from '../update-space-action'

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

describe('Update Space Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should update space successfully with valid data', async () => {
			// Arrange
			const input = { id: 'space-123', name: 'Updated Space' }
			const accountId = 'account-123'
			const updatedSpace = {
				id: 'space-123',
				name: 'Updated Space',
				created_at: new Date('2024-01-01'),
				updated_at: new Date(),
				deleted_at: null,
			}

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

			// Mock update operation
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.update) as any).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedSpace]),
					}),
				}),
			})

			// Act
			const result = await updateSpaceAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toEqual(updatedSpace)
			expect(result.error).toBeUndefined()
		})
	})

	describe('Negative Scenarios', () => {
		it('should return error if input validation fails', async () => {
			// Arrange
			const input = { id: '', name: 'Valid Name' } // Invalid: empty id

			// Act
			const result = await updateSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})

		it('should return error if no account context', async () => {
			// Arrange
			const input = { id: 'space-123', name: 'Updated Space' }

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(null)

			// Act
			const result = await updateSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('No account found.')
			expect(result.data).toBeUndefined()
		})

		it('should return error if space not found or access denied', async () => {
			// Arrange
			const input = { id: 'nonexistent-space', name: 'Updated Space' }
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
			const result = await updateSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Space not found or access denied.')
			expect(result.data).toBeUndefined()
		})

		it('should return error if update operation fails', async () => {
			// Arrange
			const input = { id: 'space-123', name: 'Updated Space' }
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

			// Mock update operation - no rows returned
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.update) as any).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([]), // No updated rows
					}),
				}),
			})

			// Act
			const result = await updateSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Failed to update space.')
			expect(result.data).toBeUndefined()
		})

		it('should return error if database operation fails', async () => {
			// Arrange
			const input = { id: 'space-123', name: 'Updated Space' }
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
			const result = await updateSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Database connection failed')
			expect(result.data).toBeUndefined()
		})
	})

	describe('Edge Cases', () => {
		it('should handle partial updates correctly', async () => {
			// Arrange
			const input = { id: 'space-123', name: 'New Name Only' }
			const accountId = 'account-123'
			const updatedSpace = {
				id: 'space-123',
				name: 'New Name Only',
				created_at: new Date('2024-01-01'),
				updated_at: new Date(),
				deleted_at: null,
			}

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

			// Mock update operation
			// biome-ignore lint/suspicious/noExplicitAny: Mock query builder chain
			;(vi.mocked(db.update) as any).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([updatedSpace]),
					}),
				}),
			})

			const { revalidatePath } = await import('next/cache')

			// Act
			const result = await updateSpaceAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toEqual(updatedSpace)
			expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/dashboard')
		})
	})
})
