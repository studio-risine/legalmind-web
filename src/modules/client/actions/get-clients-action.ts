'use server'

import { db } from '@infra/db'
import { type Client, clients } from '@infra/db/schemas/clients'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'

const getClientsInput = z.object({
	searchQuery: z.string().optional(),
	sortBy: z.enum(['created_at', 'name']).optional(),
	sortDirection: z.enum(['asc', 'desc']).optional(),
	page: z.number().optional().default(1),
	perPage: z.number().optional().default(10),
})

type GetClientsInput = z.infer<typeof getClientsInput>

interface GetClientsOutput {
	data: Client[] | null
	total: number | null
	error?: string
}

export async function getClientsAction(
	input: GetClientsInput,
): Promise<GetClientsOutput> {
	try {
		const { searchQuery, sortBy, sortDirection, page, perPage } =
			getClientsInput.parse(input)

		const accountId = await getCurrentAccountId()
		if (!accountId) {
			return { data: null, total: null, error: 'No account context.' }
		}

		const searchClause = searchQuery
			? or(
					ilike(clients.name, `%${searchQuery}%`),
					ilike(clients.email, `%${searchQuery}%`),
					ilike(clients.phone, `%${searchQuery}%`),
					ilike(clients.tax_id, `%${searchQuery}%`),
				)
			: undefined

		const whereClause = searchClause
			? and(eq(clients.account_id, accountId), searchClause)
			: eq(clients.account_id, accountId)

		const orderClause = sortBy
			? sortDirection === 'asc'
				? sortBy === 'name'
					? asc(clients.name)
					: asc(clients.created_at)
				: sortBy === 'name'
					? desc(clients.name)
					: desc(clients.created_at)
			: desc(clients.id)

		const rows = await db
			.select()
			.from(clients)
			.where(whereClause)
			.orderBy(orderClause)
			.limit(perPage)
			.offset((page - 1) * perPage)

		const [{ total }] = await db
			.select({ total: count(clients.id) })
			.from(clients)
			.where(whereClause)

		return { data: rows, total }
	} catch (error) {
		return {
			data: null,
			total: null,
			error: 'Failed to fetch clients.',
		}
	}
}
