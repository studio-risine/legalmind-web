import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccountByIdAction } from '../get-account-by-id-action'

// Mock dependencies
vi.mock('@infra/db', () => ({
	db: {
		select: vi.fn(),
	},
}))

describe('Get Account By ID Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should return account when found', async () => {
			const input = { id: 'account-123' }
			const mockAccount = {
				id: 'account-123',
				name: 'John Doe',
				displayName: 'John',
				email: 'john@example.com',
				created_at: new Date('2023-01-01'),
				updated_at: new Date('2023-01-02'),
				deleted_at: null,
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await getAccountByIdAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toEqual(mockAccount)
			expect(result.error).toBeUndefined()
		})

		it('should return valid account data structure', async () => {
			// Arrange
			const input = { id: 'account-456' }
			const mockAccount = {
				id: 'account-456',
				name: 'Jane Smith',
				displayName: 'Jane',
				email: 'jane@example.com',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await getAccountByIdAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toHaveProperty('id')
			expect(result.data).toHaveProperty('name')
			expect(result.data).toHaveProperty('displayName')
			expect(result.data).toHaveProperty('email')
			expect(result.data).toHaveProperty('created_at')
			expect(result.data).toHaveProperty('updated_at')
			expect(result.data).toHaveProperty('deleted_at')
		})
	})

	describe('Negative Scenarios', () => {
		it('should return error if input validation fails', async () => {
			// Arrange
			const input = { id: '' }

			// Act
			const result = await getAccountByIdAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})

		it('should return error if account not found', async () => {
			// Arrange
			const input = { id: 'non-existent' }

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]), // No account found
					}),
				}),
			} as never)

			// Act
			const result = await getAccountByIdAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Account not found.')
			expect(result.data).toBeUndefined()
		})

		it('should return error if database query fails', async () => {
			// Arrange
			const input = { id: 'account-123' }

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi
							.fn()
							.mockRejectedValue(new Error('Database connection failed')),
					}),
				}),
			} as never)

			// Act
			const result = await getAccountByIdAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Database connection failed')
			expect(result.data).toBeUndefined()
		})
	})

	describe('Edge Cases', () => {
		it('should not return deleted account', async () => {
			// Arrange
			const input = { id: 'deleted-account' }

			const { db } = await import('@infra/db')

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as never)

			// Act
			const result = await getAccountByIdAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Account not found.')
		})

		it('should handle special characters in account id', async () => {
			// Arrange
			const input = { id: 'account-with-special-chars-123!@#' }
			const mockAccount = {
				id: 'account-with-special-chars-123!@#',
				name: 'Special Account',
				displayName: 'Special',
				email: 'special@example.com',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await getAccountByIdAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data?.id).toBe('account-with-special-chars-123!@#')
		})

		it('should handle accounts with null optional fields', async () => {
			// Arrange
			const input = { id: 'account-minimal' }
			const mockAccount = {
				id: 'account-minimal',
				name: 'Minimal Account',
				displayName: null,
				email: 'minimal@example.com',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await getAccountByIdAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toEqual(mockAccount)
		})
	})
})
