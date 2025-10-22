'use server'

import { db } from '@infra/db'
import { type Process, processes } from '@infra/db/schemas/processes'
import { spacesToAccounts } from '@infra/db/schemas/spaces'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import {
	and,
	asc,
	count,
	desc,
	eq,
	ilike,
	inArray,
	isNull,
	or,
} from 'drizzle-orm'
import { z } from 'zod'

const getProcessesInput = z.object({
	searchQuery: z.string().optional(),
	status: z.string().optional(),
	sortBy: z.enum(['created_at', 'title']).optional(),
	sortDirection: z.enum(['asc', 'desc']).optional(),
	page: z.number().optional().default(1),
	perPage: z.number().optional().default(10),
})

type GetProcessesInput = z.infer<typeof getProcessesInput>

interface GetProcessesOutput {
	data: Process[] | null
	total: number | null
	error?: string
}

export async function getProcessesAction(
	input: GetProcessesInput,
): Promise<GetProcessesOutput> {
	try {
		const { searchQuery, status, sortBy, sortDirection, page, perPage } =
			getProcessesInput.parse(input)

		const accountId = await getCurrentAccountId()
		if (!accountId) {
			return { data: null, total: null, error: 'No account context.' }
		}

		// Get all spaces the account is a member of
		const userSpaces = await db
			.select({ spaceId: spacesToAccounts.spaceId })
			.from(spacesToAccounts)
			.where(eq(spacesToAccounts.accountId, accountId))

		if (userSpaces.length === 0) {
			return { data: [], total: 0 }
		}

		const spaceIds = userSpaces.map((s) => s.spaceId)

		const searchClause = searchQuery
			? or(
					ilike(processes.title, `%${searchQuery}%`),
					ilike(processes.cnj, `%${searchQuery}%`),
					ilike(processes.court, `%${searchQuery}%`),
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
			searchClause,
			statusClause,
		)

		const orderClause = sortBy
			? sortDirection === 'asc'
				? sortBy === 'title'
					? asc(processes.title)
					: asc(processes.created_at)
				: sortBy === 'title'
					? desc(processes.title)
					: desc(processes.created_at)
			: desc(processes.created_at)

		const rows = await db
			.select()
			.from(processes)
			.where(whereClause)
			.orderBy(orderClause)
			.limit(perPage)
			.offset((page - 1) * perPage)

		const [{ total }] = await db
			.select({ total: count() })
			.from(processes)
			.where(whereClause)

		return { data: rows as Process[], total }
	} catch (error) {
		return {
			data: null,
			total: null,
			error: 'Failed to fetch processes.',
		}
	}
}
