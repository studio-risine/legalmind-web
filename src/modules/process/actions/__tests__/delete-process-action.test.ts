import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteProcessAction } from '../delete-process-action'

vi.mock('@infra/db')
vi.mock('@modules/account/utils/get-current-account')
vi.mock('next/cache')

describe('Delete Process Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should perform soft delete successfully', async () => {
		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(db.update).mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([{ id: 'process-1' }]),
				}),
			}),
		} as never)

		const result = await deleteProcessAction({ id: 'process-1' })

		expect(result.success).toBe(true)
	})

	it('should return error if process not found', async () => {
		const { db } = await import('@infra/db')
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(1)
		vi.mocked(db.update).mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([]),
				}),
			}),
		} as never)

		const result = await deleteProcessAction({ id: 'non-existent' })

		expect(result.success).toBe(false)
		expect(result.error).toBe('Process not found or access denied')
	})

	it('should return error if no account context', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(null)

		const result = await deleteProcessAction({ id: 'process-1' })

		expect(result.success).toBe(false)
		expect(result.error).toBe('No account found')
	})
})
