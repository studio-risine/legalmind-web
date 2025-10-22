import { db } from '@infra/db'
import { processes } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { deleteProcessAction } from '@modules/process/actions/delete-process-action'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}))

vi.mock('@/modules/account/utils/get-current-account', () => ({
	getCurrentAccountId: vi.fn(),
}))

vi.mock('@infra/db', () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn().mockResolvedValue([]),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	},
}))

describe('Delete Process Action', () => {
 beforeEach(async () => {
  vi.clearAllMocks()
  const { getCurrentAccountId } = await import('@modules/account/utils/get-current-account')
  vi.mocked(getCurrentAccountId).mockResolvedValue('user-account-id')
 })	it('should delete a process successfully', async () => {
		const processId = 'process-123'
		const spaceId = 'space-123'

		vi.mocked(db.select().from().where().limit)
			.mockResolvedValueOnce([{ space_id: spaceId }])
			.mockResolvedValueOnce([{ accountId: 'user-account-id' }])

		vi.mocked(db.update(processes).set({}).where).mockResolvedValue({
			rowCount: 1,
		})

		const result = await deleteProcessAction({ id: processId })

		expect(result).toEqual({ success: true })
		expect(db.select).toHaveBeenCalledWith({ space_id: processes.space_id })
		expect(db.from).toHaveBeenCalledWith(processes)
		expect(db.where).toHaveBeenCalledWith(eq(processes.id, processId))
		expect(db.limit).toHaveBeenCalledWith(1)

		expect(db.select).toHaveBeenCalledWith({
			accountId: spacesToAccounts.accountId,
		})
		expect(db.from).toHaveBeenCalledWith(spacesToAccounts)
		expect(db.where).toHaveBeenCalledWith(
			and(
				eq(spacesToAccounts.spaceId, spaceId),
				eq(spacesToAccounts.accountId, 'user-account-id'),
			),
		)

		expect(db.update).toHaveBeenCalledWith(processes)
		expect(db.set).toHaveBeenCalledWith({ deleted_at: expect.any(Date) })
		expect(db.where).toHaveBeenCalledWith(eq(processes.id, processId))
		expect(revalidatePath).toHaveBeenCalledWith('/processes')
	})

	it('should return an error if the user is not a member of the space', async () => {
		const processId = 'process-123'
		const spaceId = 'space-123'

		vi.mocked(db.select().from().where().limit)
			.mockResolvedValueOnce([{ space_id: spaceId }])
			.mockResolvedValueOnce([])

		const result = await deleteProcessAction({ id: processId })

		expect(result).toEqual({ success: false, error: 'Unauthorized' })
	})

	it('should return an error if the process is not found', async () => {
		vi.mocked(db.select().from().where().limit).mockResolvedValueOnce([])

		const result = await deleteProcessAction({ id: 'process-404' })

		expect(result).toEqual({ success: false, error: 'Process not found' })
	})

	it('should return an error if account is not found', async () => {
		vi.mocked(getCurrentAccountId).mockResolvedValue(null)

		const result = await deleteProcessAction({ id: 'process-123' })

		expect(result).toEqual({ success: false, error: 'No account found' })
	})
})
