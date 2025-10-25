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
			} as Parameters<typeof updateAccountAction>[0]

			// Act & Assert
			await expect(updateAccountAction(invalidInput)).rejects.toThrow()
		})
	})
})