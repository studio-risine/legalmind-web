import { beforeEach, describe, expect, it, vi } from 'vitest'
import { insertSpaceAction } from '../insert-space-action'

// Mock dependencies
vi.mock('@infra/db', () => ({
	db: {
		insert: vi.fn(),
	},
}))

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

describe('Insert Space Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should create space with valid input', async () => {
			// Arrange
			const input = {
				name: 'Escritório João Silva',
				type: 'INDIVIDUAL' as const,
				createdBy: 'account-123',
			}

			const { db } = await import('@infra/db')

			const mockNewSpace = {
				id: 'space-123',
				name: 'Escritório João Silva',
				type: 'INDIVIDUAL',
				createdBy: 'account-123',
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date(),
			}

			// Mock space creation
			vi.mocked(db.insert).mockReturnValueOnce({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockNewSpace]),
				}),
			} as never)

			// Mock spacesToAccounts association
			vi.mocked(db.insert).mockReturnValueOnce({
				values: vi.fn().mockResolvedValue(undefined),
			} as never)

			// Act
			const result = await insertSpaceAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toMatchObject({
				id: 'space-123',
				name: 'Escritório João Silva',
				type: 'INDIVIDUAL',
				createdBy: 'account-123',
			})
		})

		it('should create space with default type when not provided', async () => {
			// Arrange
			const input = {
				name: 'Meu Escritório',
				createdBy: 'account-123',
			}

			const { db } = await import('@infra/db')

			const mockNewSpace = {
				id: 'space-456',
				name: 'Meu Escritório',
				type: 'INDIVIDUAL',
				createdBy: 'account-123',
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date(),
			}

			vi.mocked(db.insert).mockReturnValueOnce({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockNewSpace]),
				}),
			} as never)

			vi.mocked(db.insert).mockReturnValueOnce({
				values: vi.fn().mockResolvedValue(undefined),
			} as never)

			// Act
			const result = await insertSpaceAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data?.type).toBe('INDIVIDUAL')
		})
	})

	describe('Negative Scenarios', () => {
		it('should validate required fields', async () => {
			// Arrange
			const invalidInput = {
				// missing name and createdBy
				type: 'INDIVIDUAL' as const,
			} as Parameters<typeof insertSpaceAction>[0]

			// Act & Assert
			await expect(insertSpaceAction(invalidInput)).rejects.toThrow()
		})

		it('should throw error when space creation fails', async () => {
			// Arrange
			const input = {
				name: 'Test Space',
				createdBy: 'account-123',
			}

			const { db } = await import('@infra/db')

			// Mock failed space creation
			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([]),
				}),
			} as never)

			// Act & Assert
			await expect(insertSpaceAction(input)).rejects.toThrow('Failed to create space')
		})
	})
})