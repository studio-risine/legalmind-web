import type { Process } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
import { and, eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { insertProcessAction } from '../insert-process-action'

// Mock the entire db object inside the factory to avoid hoisting issues
vi.mock('@infra/db', () => {
	const fromMock = vi.fn()
	const whereMock = vi.fn()
	const limitMock = vi.fn()
	const valuesMock = vi.fn()
	const returningMock = vi.fn()

	const dbMock = {
		select: vi.fn(() => ({ from: fromMock })),
		insert: vi.fn(() => ({ values: valuesMock })),
		from: fromMock,
		where: whereMock,
		limit: limitMock,
		values: valuesMock,
		returning: returningMock,
	}

	// Setup the chain
	fromMock.mockReturnValue({ where: whereMock })
	whereMock.mockReturnValue({ limit: limitMock })
	valuesMock.mockReturnValue({ returning: returningMock })

	return { db: dbMock }
})

vi.mock('@modules/account/utils/get-current-account')
vi.mock('next/cache')

describe('Insert Process Action', () => {
	let db: any

	beforeEach(async () => {
		vi.clearAllMocks()
		db = (await import('@infra/db')).db
	})

	it('should create a new process if user is a member of the space', async () => {
		const mockProcess: Process = {
			id: 'process-1',
			space_id: 'space-1',
			title: 'New Process',
			cnj: '1234567-89.2023.8.26.0000',
			court: 'TJSP',
			status: 'ACTIVE',
			client_id: 'client-1',
			tags: ['test', 'important'],
			created_at: new Date(),
			updated_at: new Date(),
			deleted_at: null,
			archived_at: null,
		}

		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue('account-1')
		vi.mocked(db.limit).mockResolvedValue([
			{ accountId: 'account-1', spaceId: 'space-1' },
		]) // membership check
		vi.mocked(db.returning).mockResolvedValue([mockProcess])

		const input = {
			space_id: 'space-1',
			title: 'New Process',
			cnj: '1234567-89.2023.8.26.0000',
			court: 'TJSP',
			client_id: 'client-1',
			tags: ['test', 'important'],
		}

		const result = await insertProcessAction(input)

		expect(result.success).toBe(true)
		expect(result.data).toBeDefined()
		expect(result.data?.title).toBe('New Process')
		expect(db.where).toHaveBeenCalledWith(
			and(
				eq(spacesToAccounts.spaceId, 'space-1'),
				eq(spacesToAccounts.accountId, 'account-1'),
			),
		)
	})

	it('should return an error if input validation fails', async () => {
		const input = {
			title: 'Valid Title',
			space_id: 'space-1',
			tags: 'invalid-tags', // Should be array
		}

		const result = await insertProcessAction(input as never)

		expect(result.success).toBe(false)
		expect(result.error).toBeDefined()
	})

	it('should return error if no account context', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue(null)

		const input = {
			space_id: 'space-1',
			title: 'New Process',
			tags: [],
		}

		const result = await insertProcessAction(input)

		expect(result.success).toBe(false)
		expect(result.error).toBe('No account found to associate process.')
	})

	it('should return error if user is not a member of the space', async () => {
		const { getCurrentAccountId } = await import(
			'@modules/account/utils/get-current-account'
		)

		vi.mocked(getCurrentAccountId).mockResolvedValue('account-1')
		vi.mocked(db.limit).mockResolvedValue([]) // membership check fails

		const input = {
			space_id: 'space-2',
			title: 'New Process',
			tags: [],
		}

		const result = await insertProcessAction(input)

		expect(result.success).toBe(false)
		expect(result.error).toBe('Access denied: not a member of this space')
	})
})
