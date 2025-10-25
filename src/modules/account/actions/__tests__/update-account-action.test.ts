import { ResourceNotFoundError } from '@errors/resource-not-found-error'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { updateAccountAction } from '../update-account-action'

// Mock dependencies
vi.mock('@infra/db', () => ({
	db: {
		select: vi.fn(),
		update: vi.fn(),
	},
}))

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

describe('Update Account Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should update account with valid onboarding data', async () => {
			// Arrange
			const input = {
				id: 'account-123',
				displayName: 'Dr. João Silva',
				email: 'joao@example.com',
				phoneNumber: '+5511999999999',
				oabNumber: '123456',
				oabState: 'SP',
			}

			const { db } = await import('@infra/db')

			// Mock account exists check
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			// Mock update
			const mockUpdatedAccount = {
				id: 'account-123',
				displayName: 'Dr. João Silva',
				fullName: null,
				email: 'joao@example.com',
				phoneNumber: '+5511999999999',
				profilePictureUrl: null,
				oabNumber: '123456',
				oabState: 'SP',
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date(),
			}

			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([mockUpdatedAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await updateAccountAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toMatchObject({
				id: 'account-123',
				displayName: 'Dr. João Silva',
				email: 'joao@example.com',
				phoneNumber: '+5511999999999',
				oabNumber: '123456',
				oabState: 'SP',
			})
		})
	})

	describe('Negative Scenarios', () => {
		it('should throw ResourceNotFoundError when account does not exist', async () => {
			// Arrange
			const input = {
				id: 'non-existent-account',
				displayName: 'Dr. João Silva',
				phoneNumber: '+5511999999999',
				oabNumber: '123456',
				oabState: 'SP',
			}

			const { db } = await import('@infra/db')

			// Mock account not found
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as never)

			// Act & Assert
			await expect(updateAccountAction(input)).rejects.toThrow(ResourceNotFoundError)
		})

		it('should validate required fields', async () => {
			// Arrange
			const invalidInput = {
				// missing id
				displayName: 'Dr. João Silva',
			} as any

			// Act & Assert
			await expect(updateAccountAction(invalidInput)).rejects.toThrow()
		})
	})
})
import { updateAccountAction } from '../update-account-action'

// Mock dependencies
vi.mock('@infra/db', () => ({
	db: {
		select: vi.fn(),
		update: vi.fn(),
	},
}))

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

describe('Update Account Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should update account with valid input', async () => {
			// Arrange
			const input = {
				id: 'account-123',
				displayName: 'Dr. João Silva',
				email: 'joao@example.com',
				phoneNumber: '+5511999999999',
				oabNumber: '123456',
				oabState: 'SP',
			}

			const { db } = await import('@infra/db')

			// Mock account exists check
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			// Mock update
			const mockUpdatedAccount = {
				id: 'account-123',
				name: 'Updated Name',
				displayName: 'John',
				email: 'updated@example.com',
				created_at: new Date('2024-01-01'),
				updated_at: new Date(),
				deleted_at: null,
			}

			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([mockUpdatedAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await updateAccountAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toMatchObject({
				id: 'account-123',
				name: 'Updated Name',
				email: 'updated@example.com',
			})
			expect(result.error).toBeUndefined()
		})

		it('should only update provided fields', async () => {
			// Arrange
			const input = {
				id: 'account-123',
				name: 'New Name Only',
			}

			const { db } = await import('@infra/db')

			// Mock account exists
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			const mockUpdatedAccount = {
				id: 'account-123',
				name: 'New Name Only',
				displayName: 'Original Display',
				email: 'original@example.com',
				created_at: new Date('2024-01-01'),
				updated_at: new Date(),
				deleted_at: null,
			}

			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([mockUpdatedAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await updateAccountAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data?.name).toBe('New Name Only')
		})
	})

	describe('Negative Scenarios', () => {
		it('should return error if input validation fails', async () => {
			// Arrange
			const input = { id: '' } // Invalid: empty id

			// Act
			const result = await updateAccountAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})

		it('should return error if account not found', async () => {
			// Arrange
			const input = {
				id: 'non-existent',
				name: 'Updated Name',
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]), // No account found
					}),
				}),
			} as never)

			// Act
			const result = await updateAccountAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Account not found.')
			expect(result.data).toBeUndefined()
		})

		it('should return error if database update fails', async () => {
			// Arrange
			const input = {
				id: 'account-123',
				name: 'Updated Name',
			}

			const { db } = await import('@infra/db')

			// Mock account exists
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			// Mock update failure
			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockRejectedValue(new Error('Database error')),
					}),
				}),
			} as never)

			// Act
			const result = await updateAccountAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Database error')
			expect(result.data).toBeUndefined()
		})
	})

	describe('Edge Cases', () => {
		it('should handle updating with same values', async () => {
			// Arrange
			const input = {
				id: 'account-123',
				name: 'Same Name',
				email: 'same@example.com',
			}

			const { db } = await import('@infra/db')

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			const mockAccount = {
				id: 'account-123',
				name: 'Same Name',
				displayName: null,
				email: 'same@example.com',
				created_at: new Date('2024-01-01'),
				updated_at: new Date(),
				deleted_at: null,
			}

			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([mockAccount]),
					}),
				}),
			} as never)

			// Act
			const result = await updateAccountAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toMatchObject(input)
		})
	})
})
