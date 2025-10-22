'use server'

import { db } from '@infra/db'
import { type Process, processes } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, count, desc, eq, ilike, inArray, isNull, or } from 'drizzle-orm'
import { z } from 'zod'

const searchProcessesInput = z.object({
	q: z.string().optional(),
	status: z.string().optional(),
	page: z.number().optional().default(1),
	pageSize: z.number().optional().default(20),
})

export type SearchProcessesInput = z.infer<typeof searchProcessesInput>

export interface SearchProcessesOutput {
	processes: Process[]
	total: number
	hasMore: boolean
	error?: string
}

export async function searchProcessesAction(
	input?: SearchProcessesInput,
): Promise<SearchProcessesOutput> {
	const { q, status, page, pageSize } = searchProcessesInput.parse(input ?? {})
	const offset = (page - 1) * pageSize

	try {
		const accountId = await getCurrentAccountId()
		if (!accountId) {
			return {
				processes: [],
				total: 0,
				hasMore: false,
				error: 'No account context.',
			}
		}

		// Get all spaces the account is a member of
		const userSpaces = await db
			.select({ spaceId: spacesToAccounts.spaceId })
			.from(spacesToAccounts)
			.where(eq(spacesToAccounts.accountId, accountId))

		if (userSpaces.length === 0) {
			return { processes: [], total: 0, hasMore: false }
		}

		const spaceIds = userSpaces.map((s) => s.spaceId)

		const searchClause = q
			? or(
					ilike(processes.title, `%${q}%`),
					ilike(processes.cnj, `%${q}%`),
					ilike(processes.court, `%${q}%`),
				)
			: undefined

		const statusClause = status
			? eq(
					processes.status,
					status as 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'CLOSED',
				)
			: undefined

		const whereClause = and(
			inArray(processes.space_id, spaceIds),
			isNull(processes.deleted_at),
			...(searchClause ? [searchClause] : []),
			...(statusClause ? [statusClause] : []),
		)

		const rows = await db
			.select()
			.from(processes)
			.where(whereClause)
			.orderBy(desc(processes.created_at))
			.limit(pageSize)
			.offset(offset)

		const [{ total }] = await db
			.select({ total: count() })
			.from(processes)
			.where(whereClause)

		const hasMore = offset + rows.length < total

		return {
			processes: rows as Process[],
			total,
			hasMore,
		}
	} catch (error) {
		return {
			processes: [],
			total: 0,
			hasMore: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
