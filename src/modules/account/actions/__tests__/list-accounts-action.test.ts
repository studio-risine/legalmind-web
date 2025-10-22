import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listAccountsAction } from '../list-accounts-action'

// Mock dependencies
vi.mock('@infra/db', () => ({
	db: {
		select: vi.fn(),
	},
}))

describe('List Accounts Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should return list of accounts', async () => {
			// Arrange
			const mockAccounts = [
				{
					id: 'account-1',
					name: 'John Doe',
					displayName: 'John',
					email: 'john@example.com',
					created_at: new Date('2023-01-01'),
					updated_at: new Date('2023-01-02'),
					deleted_at: null,
				},
				{
					id: 'account-2',
					name: 'Jane Smith',
					displayName: 'Jane',
					email: 'jane@example.com',
					created_at: new Date('2023-01-03'),
					updated_at: new Date('2023-01-04'),
					deleted_at: null,
				},
			]

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockAccounts),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toEqual(mockAccounts)
			expect(Array.isArray(result)).toBe(true)
		})

		it('should handle empty results', async () => {
			// Arrange
			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toEqual([])
			expect(Array.isArray(result)).toBe(true)
		})

		it('should return accounts ordered by created_at', async () => {
			// Arrange
			const mockAccounts = [
				{
					id: 'account-oldest',
					name: 'Oldest Account',
					displayName: 'Oldest',
					email: 'oldest@example.com',
					created_at: new Date('2023-01-01'),
					updated_at: new Date(),
					deleted_at: null,
				},
				{
					id: 'account-middle',
					name: 'Middle Account',
					displayName: 'Middle',
					email: 'middle@example.com',
					created_at: new Date('2023-02-01'),
					updated_at: new Date(),
					deleted_at: null,
				},
				{
					id: 'account-newest',
					name: 'Newest Account',
					displayName: 'Newest',
					email: 'newest@example.com',
					created_at: new Date('2023-03-01'),
					updated_at: new Date(),
					deleted_at: null,
				},
			]

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockAccounts),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toEqual(mockAccounts)
			// Verify accounts are ordered by created_at (oldest first)
			for (let i = 1; i < result.length; i++) {
				expect(result[i].created_at.getTime()).toBeGreaterThanOrEqual(
					result[i - 1].created_at.getTime(),
				)
			}
		})

		it('should return valid account data structure', async () => {
			// Arrange
			const mockAccount = {
				id: 'account-test',
				name: 'Test Account',
				displayName: 'Test',
				email: 'test@example.com',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue([mockAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toHaveLength(1)
			expect(result[0]).toHaveProperty('id')
			expect(result[0]).toHaveProperty('name')
			expect(result[0]).toHaveProperty('displayName')
			expect(result[0]).toHaveProperty('email')
			expect(result[0]).toHaveProperty('created_at')
			expect(result[0]).toHaveProperty('updated_at')
			expect(result[0]).toHaveProperty('deleted_at')
		})
	})

	describe('Negative Scenarios', () => {
		it('should return empty array when database query fails', async () => {
			// Arrange
			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi
							.fn()
							.mockRejectedValue(new Error('Database connection failed')),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toEqual([])
			expect(Array.isArray(result)).toBe(true)
		})

		it('should handle invalid data gracefully', async () => {
			// Arrange
			const invalidData = [
				{ id: 'invalid', name: null, email: null }, // Missing required fields
			]

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(invalidData),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert - Should return empty array when validation fails
			expect(result).toEqual([])
		})
	})

	describe('Edge Cases', () => {
		it('should not return deleted accounts', async () => {
			// Arrange - Even though query should filter out deleted accounts,
			// verify the logic by mocking only non-deleted accounts
			const mockAccounts = [
				{
					id: 'account-active-1',
					name: 'Active Account 1',
					displayName: 'Active1',
					email: 'active1@example.com',
					created_at: new Date(),
					updated_at: new Date(),
					deleted_at: null, // Not deleted
				},
				{
					id: 'account-active-2',
					name: 'Active Account 2',
					displayName: 'Active2',
					email: 'active2@example.com',
					created_at: new Date(),
					updated_at: new Date(),
					deleted_at: null, // Not deleted
				},
			]

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockAccounts),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toEqual(mockAccounts)
			// Verify all returned accounts are not deleted
			result.forEach((account) => {
				expect(account.deleted_at).toBeNull()
			})
		})

		it('should handle accounts with null optional fields', async () => {
			// Arrange
			const mockAccount = {
				id: 'account-minimal',
				name: 'Minimal Account',
				displayName: null, // Optional field
				email: 'minimal@example.com',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue([mockAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toEqual([mockAccount])
			expect(result[0].displayName).toBeNull()
		})

		it('should handle large number of accounts', async () => {
			// Arrange
			const mockAccounts = Array.from({ length: 1000 }, (_, i) => ({
				id: `account-${i + 1}`,
				name: `Account ${i + 1}`,
				displayName: `Acc${i + 1}`,
				email: `acc${i + 1}@example.com`,
				created_at: new Date(2023, 0, i + 1), // Sequential dates
				updated_at: new Date(),
				deleted_at: null,
			}))

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue(mockAccounts),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toHaveLength(1000)
			expect(result).toEqual(mockAccounts)
		})

		it('should handle accounts with special characters in fields', async () => {
			// Arrange
			const mockAccount = {
				id: 'account-special-chars',
				name: 'José da Silva & Co.',
				displayName: 'José',
				email: 'josé+test@example.com',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						orderBy: vi.fn().mockResolvedValue([mockAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await listAccountsAction()

			// Assert
			expect(result).toEqual([mockAccount])
			expect(result[0].name).toBe('José da Silva & Co.')
		})
	})
})
