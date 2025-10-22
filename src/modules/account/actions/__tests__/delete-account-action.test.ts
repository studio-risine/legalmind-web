import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteAccountAction } from '../delete-account-action'

vi.mock('@infra/db', () => ({
	db: {
		select: vi.fn(),
		update: vi.fn(),
	},
}))

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

describe('Delete Account Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Positive Scenarios', () => {
		it('should perform soft delete on existing account', async () => {
			const input = { id: 'account-123' }

			const { db } = await import('@infra/db')

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			const result = await deleteAccountAction(input)

			expect(result.success).toBe(true)
			expect(result.error).toBeUndefined()
		})

		it('should revalidate dashboard path after deletion', async () => {
			const input = { id: 'account-123' }

			const { db } = await import('@infra/db')
			const { revalidatePath } = await import('next/cache')

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			await deleteAccountAction(input)

			expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
		})
	})

	describe('Negative Scenarios', () => {
		it('should return error if input validation fails', async () => {
			const input = { id: '' } // Invalid: empty id

			const result = await deleteAccountAction(input)

			expect(result.success).toBe(false)
			expect(result.error).toBeDefined()
		})

		it('should return error if account not found', async () => {
			const input = { id: 'non-existent' }

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]), // No account found
					}),
				}),
			} as never)

			const result = await deleteAccountAction(input)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Account not found.')
		})

		it('should return error if database update fails', async () => {
			const input = { id: 'account-123' }

			const { db } = await import('@infra/db')

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockRejectedValue(new Error('Database error')),
					}),
				}),
			} as never)

			const result = await deleteAccountAction(input)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Database error')
		})
	})

	describe('Edge Cases', () => {
		it('should not delete already deleted account', async () => {
			const input = { id: 'deleted-account' }

			const { db } = await import('@infra/db')
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as never)

			const result = await deleteAccountAction(input)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Account not found.')
		})

		it('should handle concurrent deletion scenarios', async () => {
			const input = { id: 'account-123' }

			const { db } = await import('@infra/db')

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([{ id: 'account-123' }]),
					}),
				}),
			} as never)

			vi.mocked(db.update).mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as never)

			const result = await deleteAccountAction(input)

			expect(result.success).toBe(false)
			expect(result.error).toBe('Failed to delete account.')
		})
	})
})
