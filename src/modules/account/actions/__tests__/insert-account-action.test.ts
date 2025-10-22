import { beforeEach, describe, expect, it, vi } from 'vitest'
import { insertAccountAction } from '../insert-account-action'

vi.mock('@infra/db', () => ({
	db: {
		insert: vi.fn(),
	},
}))

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

describe('Insert Account Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should create a new account with valid input', async () => {
			const input = {
				name: 'John Doe',
				displayName: 'John',
				email: 'john@example.com',
			}

			const { db } = await import('@infra/db')

			const mockAccount = {
				id: 'account-123',
				name: 'John Doe',
				displayName: 'John',
				email: 'john@example.com',
				created_at: new Date(),
				updated_at: null,
				deleted_at: null,
			}

			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockAccount]),
				}),
			} as never)

			const result = await insertAccountAction(input)

			expect(result.success).toBe(true)
			expect(result.data).toMatchObject({
				id: 'account-123',
				name: 'John Doe',
				email: 'john@example.com',
			})
			expect(result.error).toBeUndefined()
		})

		it('should handle optional fields correctly', async () => {
			const input = {
				name: 'Jane Doe',
			}

			const { db } = await import('@infra/db')
			const mockAccount = {
				id: 'account-456',
				name: 'Jane Doe',
				displayName: null,
				email: null,
				created_at: new Date(),
				updated_at: null,
				deleted_at: null,
			}

			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockAccount]),
				}),
			} as never)

			const result = await insertAccountAction(input)

			expect(result.success).toBe(true)
			expect(result.data?.name).toBe('Jane Doe')
			expect(result.data?.displayName).toBe(null)
			expect(result.data?.email).toBe(null)
		})
	})

	describe('Negative Scenarios', () => {
		it('should return error if input validation fails', async () => {
			const input = { name: 123 }

			const result = await insertAccountAction(input as never)

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
			expect(result.data).toBeUndefined()
		})

		it('should return error if database insert fails', async () => {
			const input = {
				name: 'John Doe',
				email: 'john@example.com',
			}

			const { db } = await import('@infra/db')

			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockRejectedValue(new Error('Database error')),
				}),
			} as never)

			const result = await insertAccountAction(input)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Database error')
			expect(result.data).toBeUndefined()
		})

		it('should return error if no row is returned from database', async () => {
			const input = {
				name: 'John Doe',
				email: 'john@example.com',
			}

			const { db } = await import('@infra/db')
			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([]),
				}),
			} as never)

			const result = await insertAccountAction(input)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Failed to create account')
			expect(result.data).toBeUndefined()
		})
	})

	describe('Edge Cases', () => {
		it('should handle email uniqueness constraint violation', async () => {
			const input = {
				name: 'John Doe',
				email: 'existing@example.com',
			}

			const { db } = await import('@infra/db')
			const uniqueConstraintError = new Error(
				'duplicate key value violates unique constraint',
			)
			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockRejectedValue(uniqueConstraintError),
				}),
			} as never)

			const result = await insertAccountAction(input)

			expect(result.success).toBe(false)
			expect(result.error).toContain('duplicate key value')
		})

		it('should handle special characters in text fields', async () => {
			const input = {
				name: 'José da Silva Ñoño',
				displayName: 'José',
				email: 'jose+test@example.com',
			}

			const { db } = await import('@infra/db')
			const mockAccount = {
				id: 'account-789',
				...input,
				created_at: new Date(),
				updated_at: null,
				deleted_at: null,
			}

			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockAccount]),
				}),
			} as never)

			const result = await insertAccountAction(input)

			expect(result.success).toBe(true)
			expect(result.data?.name).toBe('José da Silva Ñoño')
			expect(result.data?.email).toBe('jose+test@example.com')
		})
	})
})
