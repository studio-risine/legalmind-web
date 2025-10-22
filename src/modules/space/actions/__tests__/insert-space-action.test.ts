import { beforeEach, describe, expect, it, vi } from 'vitest'
import { insertSpaceAction } from '../insert-space-action'

// Mock dependencies
vi.mock('@infra/db', () => ({
	db: {
		insert: vi.fn(),
		transaction: vi.fn(),
	},
}))

vi.mock('@modules/account/utils/get-current-account', () => ({
	getCurrentAccountId: vi.fn(),
}))

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

describe('Insert Space Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should create a new space with valid input', async () => {
			// Arrange
			const input = { name: 'Test Space' }
			const accountId = 'account-123'

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(accountId)

			const { db } = await import('@infra/db')
			const mockSpace = {
				id: 'space-123',
				name: 'Test Space',
				created_at: new Date(),
				updated_at: null,
				deleted_at: null,
			}

			vi.mocked(db.transaction).mockImplementation(async (callback) => {
				const tx = {
					insert: vi.fn().mockReturnValue({
						values: vi.fn().mockReturnValue({
							returning: vi.fn().mockResolvedValue([mockSpace]),
						}),
					}),
				}
				// biome-ignore lint/suspicious/noExplicitAny: Mock transaction needs any
				return callback(tx as any)
			})

			// Act
			const result = await insertSpaceAction(input)

			// Assert
			expect(result.success).toBe(true)
			expect(result.data).toMatchObject({
				id: 'space-123',
				name: 'Test Space',
			})
			expect(result.error).toBeUndefined()
		})
	})

	describe('Negative Scenarios', () => {
		it('should return error if input validation fails', async () => {
			// Arrange
			const input = { name: '' }

			// Act
			const result = await insertSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})

		it('should return error if no account context', async () => {
			// Arrange
			const input = { name: 'Test Space' }

			const { getCurrentAccountId } = await import(
				'@modules/account/utils/get-current-account'
			)
			vi.mocked(getCurrentAccountId).mockResolvedValue(null)

			// Act
			const result = await insertSpaceAction(input)

			// Assert
			expect(result.success).toBe(false)
			expect(result.error).toBe('No account found to associate space.')
			expect(result.data).toBeUndefined()
		})
	})
})
