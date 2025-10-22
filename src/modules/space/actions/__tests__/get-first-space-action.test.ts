import { beforeEach, describe, expect, it, vi } from 'vitest'

// Define the mock result type
type MockRow = {
	id: string
	name: string | null
	created_by: string
	created_at: Date
	updated_at: Date | null
	deleted_at: Date | null
}

let mockDbResult: MockRow[] = []

// Mock database
vi.mock('@infra/db', () => {
	const chain = {
		from: vi.fn().mockReturnThis(),
		innerJoin: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockImplementation(async () => mockDbResult),
	}
	const db = {
		select: vi.fn(() => chain),
	}
	return { db }
})

import { getFirstSpaceAction } from '../get-first-space-action'

describe('getFirstSpaceAction', () => {
	const mockConsoleError = vi
		.spyOn(console, 'error')
		.mockImplementation(() => {})

	beforeEach(() => {
		mockDbResult = []
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should return the first space when it exists for the account', async () => {
			// Arrange
			const now = new Date()
			const mockAccountId = 'account-1'
			const mockSpaceId = 'space-1'

			mockDbResult = [
				{
					id: mockSpaceId,
					name: 'First Space',
					created_by: mockAccountId,
					created_at: now,
					updated_at: null,
					deleted_at: null,
				},
			]

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toBeDefined()
			expect(result.data?.id).toBe(mockSpaceId)
			expect(result.data?.name).toBe('First Space')
			expect(result.data?.deleted_at).toBeNull()
			expect(result.error).toBeUndefined()
		})

		it('should return the first space even when multiple spaces exist', async () => {
			// Arrange
			const now = new Date()
			const mockAccountId = 'account-1'

			mockDbResult = [
				{
					id: 'space-1',
					name: 'First Space',
					created_by: mockAccountId,
					created_at: now,
					updated_at: null,
					deleted_at: null,
				},
			]

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(true)
			expect(result.data?.id).toBe('space-1')
			expect(result.data?.name).toBe('First Space')
		})
	})

	describe('Negative Scenarios', () => {
		it('should return error if input validation fails (empty accountId)', async () => {
			// Arrange
			const input = { accountId: '' }

			// Act
			const result = await getFirstSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.error).toContain('Account ID is required')
			expect(result.data).toBeUndefined()
		})

		it('should return error if input validation fails (missing accountId)', async () => {
			// Arrange
			// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
			const input = {} as any

			// Act
			const result = await getFirstSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})

		it('should return error from createValidatedAction when accountId is null', async () => {
			// Arrange
			// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input type
			const input = { accountId: null as any }

			// Act
			const result = await getFirstSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.error).toContain('expected string')
			expect(result.error).toContain('received null')
			expect(result.data).toBeUndefined()
		})

		it('should return error from createValidatedAction when accountId is a number', async () => {
			// Arrange
			// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input type
			const input = { accountId: 123 as any }

			// Act
			const result = await getFirstSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.error).toContain('expected string')
			expect(result.error).toContain('received number')
			expect(result.data).toBeUndefined()
		})

		it('should return error from createValidatedAction when input is completely invalid', async () => {
			// Arrange
			// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
			const input = 'invalid-string' as any

			// Act
			const result = await getFirstSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})

		it('should return error from createValidatedAction when input is an array', async () => {
			// Arrange
			// biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
			const input = ['account-1'] as any

			// Act
			const result = await getFirstSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})

		it('should return error from createValidatedAction with whitespace-only accountId', async () => {
			// Arrange
			const input = { accountId: '   ' }

			// Act
			const result = await getFirstSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			// Whitespace-only strings pass min(1) but may fail other validations
			expect(result.data).toBeUndefined()
		})

		it('should return error when no space exists for the account', async () => {
			// Arrange
			const mockAccountId = 'account-with-no-spaces'
			mockDbResult = []

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('No space found for the specified account.')
			expect(result.data).toBeUndefined()
		})

		it('should return error when account does not exist', async () => {
			// Arrange
			const mockAccountId = 'non-existent-account'
			mockDbResult = [] // Empty result simulates account not found

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('No space found for the specified account.')
			expect(result.data).toBeUndefined()
		})

		it('should not return soft-deleted spaces', async () => {
			// Arrange
			const mockAccountId = 'account-1'
			mockDbResult = [] // Empty because soft-deleted spaces are filtered out by isNull(spaces.deleted_at)

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('No space found for the specified account.')
			expect(result.data).toBeUndefined()
		})
	})

	describe('Error Handling', () => {
		it('should return error and log when database query throws an exception', async () => {
			// Arrange
			const mockAccountId = 'account-1'
			const mockError = new Error('Database connection failed')

			// Mock the database to throw an error
			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockImplementationOnce(() => {
				throw mockError
			})

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Database connection failed')
			expect(result.data).toBeUndefined()
			expect(mockConsoleError).toHaveBeenCalledTimes(1)
			expect(mockConsoleError).toHaveBeenCalledWith(
				'Failed to get first space:',
				mockError,
			)
		})

		it('should return error when database query throws non-Error exception', async () => {
			// Arrange
			const mockAccountId = 'account-1'

			// Mock the database to throw a non-Error exception
			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockImplementationOnce(() => {
				throw 'String error'
			})

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('Unknown error occurred.')
			expect(result.data).toBeUndefined()
			expect(mockConsoleError).toHaveBeenCalledTimes(1)
		})

		it('should return error when schema validation fails', async () => {
			// Arrange
			const mockAccountId = 'account-1'

			// Mock invalid data that will fail schema validation
			mockDbResult = [
				{
					id: 'space-1',
					// biome-ignore lint/suspicious/noExplicitAny: Testing schema validation error
					name: 123 as any, // Invalid type - should be string | null
					created_by: mockAccountId,
					created_at: new Date(),
					updated_at: null,
					deleted_at: null,
				},
			]

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})
	})

	describe('Edge Cases', () => {
		it('should handle space with null name', async () => {
			// Arrange
			const now = new Date()
			const mockAccountId = 'account-1'

			mockDbResult = [
				{
					id: 'space-1',
					name: null,
					created_by: mockAccountId,
					created_at: now,
					updated_at: null,
					deleted_at: null,
				},
			]

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(true)
			expect(result.data?.id).toBe('space-1')
			expect(result.data?.name).toBeNull()
		})

		it('should handle space with updated_at set', async () => {
			// Arrange
			const createdAt = new Date('2025-01-01')
			const updatedAt = new Date('2025-10-22')
			const mockAccountId = 'account-1'

			mockDbResult = [
				{
					id: 'space-1',
					name: 'Updated Space',
					created_by: mockAccountId,
					created_at: createdAt,
					updated_at: updatedAt,
					deleted_at: null,
				},
			]

			// Act
			const result = await getFirstSpaceAction({ accountId: mockAccountId })

			// Assert
			expect(result.success).toBe(true)
			expect(result.data?.id).toBe('space-1')
			expect(result.data?.updated_at).toEqual(updatedAt)
		})
	})
})
