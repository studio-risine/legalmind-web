'use server'

import { db } from '@infra/db'
import { type Client, clients } from '@infra/db/schemas/clients'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, count, desc, eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'

const searchClientsInput = z.object({
	q: z.string().optional(),
	status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
	page: z.number().optional().default(1),
	pageSize: z.number().optional().default(20),
})

export type SearchClientsInput = z.infer<typeof searchClientsInput>

export interface SearchClientsOutput {
	clients: Client[]
	total: number
	hasMore: boolean
	error?: string
}

export async function searchClientsAction(
	input?: SearchClientsInput,
): Promise<SearchClientsOutput> {
	const { q, status, page, pageSize } = searchClientsInput.parse(input ?? {})
	const offset = (page - 1) * pageSize

	try {
		const accountId = await getCurrentAccountId()
		if (!accountId) {
			return {
				clients: [],
				total: 0,
				hasMore: false,
				error: 'No account context.',
			}
		}

		// Build search and filters
		const searchClause = q
			? or(
					ilike(clients.name, `%${q}%`),
					ilike(clients.email, `%${q}%`),
					ilike(clients.phone, `%${q}%`),
					ilike(clients.tax_id, `%${q}%`),
				)
			: undefined

		const statusClause = status ? eq(clients.status, status) : undefined

		const whereClause = and(
			eq(clients.account_id, accountId),
			...(searchClause ? [searchClause] : []),
			...(statusClause ? [statusClause] : []),
		)

		const rows = await db
			.select()
			.from(clients)
			.where(whereClause)
			.orderBy(desc(clients.created_at))
			.limit(pageSize)
			.offset(offset)

		const [{ total }] = await db
			.select({ total: count(clients.id) })
			.from(clients)
			.where(whereClause)

		const hasMore = offset + pageSize < (total ?? 0)

		return {
			clients: rows,
			total: total ?? 0,
			hasMore,
		}
	} catch (error) {
		return {
			clients: [],
			total: 0,
			hasMore: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
