import { db } from '@infra/db'
import { processes } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
import { getProcessByIdAction } from '@modules/process/actions/get-process-by-id-action'
import { and, eq, isNull } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockUser = {
	id: 'user-123',
	name: 'Test User',
	email: 'test@example.com',
	image: null,
	createdAt: new Date(),
	updatedAt: new Date(),
	accountId: 'user-account-id',
}

vi.mock('@infra/db', () => {
	const mockProcess = {
		id: 'process-123',
		title: 'Test Process',
		space_id: 'space-123',
		client_id: 'client-123',
		cnj: '1234567-89.2023.8.26.0000',
		court: 'TJSP',
		status: 'ACTIVE' as const,
		tags: null,
		archived_at: null,
		created_at: new Date(),
		updated_at: new Date(),
		deleted_at: null,
	}
	return {
		db: {
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			limit: vi.fn().mockResolvedValue([mockProcess]),
			query: {
				spacesToAccounts: {
					findFirst: vi
						.fn()
						.mockResolvedValue({ accountId: 'user-account-id' }),
				},
			},
		},
	}
})

vi.mock('@modules/account/actions/get-authenticated-user-action', () => ({
	getAuthenticatedUser: vi.fn(),
}))

vi.mock('@modules/account/utils/get-current-account', () => ({
	getCurrentAccountId: vi.fn(),
}))

describe('Get Process By ID Action', () => {
	beforeEach(async () => {
		vi.clearAllMocks()
	})

	it('should return a process by id if user is a member of the space', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)
		vi.mocked(getCurrentAccountId).mockResolvedValue('account-1')

		const processId = 'process-1'
		const spaceId = 'space-1'
		const mockProcessData = {
			id: processId,
			space_id: spaceId,
			title: 'Test Process',
		}
		const mockMembership = { accountId: 'account-1', spaceId }

		vi.mocked(db.select().from().where().limit).mockResolvedValueOnce([
			mockProcessData,
		])

		vi.mocked(db.query.spacesToAccounts.findFirst).mockResolvedValueOnce(
			mockMembership,
		)

		const result = await getProcessByIdAction({ id: processId })

		expect(result).toBeDefined()
		expect(result?.id).toBe(processId)
		expect(db.select).toHaveBeenCalled()
		expect(db.from).toHaveBeenCalledWith(processes)
		expect(db.where).toHaveBeenCalledWith(
			and(eq(processes.id, processId), isNull(processes.deleted_at)),
		)
		expect(db.limit).toHaveBeenCalledWith(1)

		expect(db.query.spacesToAccounts.findFirst).toHaveBeenCalledWith({
			where: and(
				eq(spacesToAccounts.spaceId, spaceId),
				eq(spacesToAccounts.accountId, 'account-1'),
			),
		})
	})

	it('should return null if process not found', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)
		vi.mocked(getCurrentAccountId).mockResolvedValue('account-1')

		vi.mocked(db.select().from().where().limit).mockResolvedValueOnce([])

		const result = await getProcessByIdAction({ id: 'non-existent-process' })

		expect(result).toBeNull()
	})

	it('should return null if user is not a member of the space', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)
		vi.mocked(getCurrentAccountId).mockResolvedValue('account-2')

		const processId = 'process-1'
		const spaceId = 'space-1'
		const mockProcessData = {
			id: processId,
			space_id: spaceId,
			title: 'Test Process',
		}

		vi.mocked(db.select().from().where().limit).mockResolvedValueOnce([
			mockProcessData,
		])

		vi.mocked(db.query.spacesToAccounts.findFirst).mockResolvedValueOnce(
			undefined,
		)

		const result = await getProcessByIdAction({ id: processId })

		expect(result).toBeNull()
	})
})
