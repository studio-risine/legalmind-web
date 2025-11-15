'use server'

import { db } from '@infra/db'
import { type Deadline, deadlines } from '@infra/db/schemas/core'
import { getCurrentAccountId } from '@modules/account/utils/get-current-account'
import { and, asc, count, desc, eq, gte, isNull, lte } from 'drizzle-orm'
import { z } from 'zod'

const getDeadlinesInput = z.object({
	dueFrom: z.date().optional(),
	dueTo: z.date().optional(),
	page: z.number().optional().default(1),
	perPage: z.number().min(1).max(100).optional().default(25),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
	processId: z.string().uuid().optional(),
	sortBy: z.enum(['dueDate', 'createdAt', 'priority']).optional(),
	sortDirection: z.enum(['asc', 'desc']).optional(),
	status: z.enum(['OPEN', 'DONE', 'CANCELED']).optional(),
})

type GetDeadlinesInput = z.infer<typeof getDeadlinesInput>

interface GetDeadlinesOutput {
	data: Deadline[] | null
	total: number | null
	error?: string
}

export async function getDeadlinesAction(
	input: GetDeadlinesInput,
): Promise<GetDeadlinesOutput> {
	try {
		const {
			processId,
			status,
			priority,
			dueFrom,
			dueTo,
			sortBy,
			sortDirection,
			page,
			perPage,
		} = getDeadlinesInput.parse(input)

		const accountId = await getCurrentAccountId()
		if (!accountId) {
			return {
				data: null,
				error: 'No account context.',
				total: null,
			}
		}

		const conditions = [
			eq(deadlines.accountId, accountId),
			isNull(deadlines.deletedAt),
		]

		if (processId) {
			conditions.push(eq(deadlines.processId, processId))
		}
		if (status) {
			conditions.push(eq(deadlines.status, status))
		}
		if (priority) {
			conditions.push(eq(deadlines.priority, priority))
		}
		if (dueFrom) {
			conditions.push(gte(deadlines.dueDate, dueFrom))
		}
		if (dueTo) {
			conditions.push(lte(deadlines.dueDate, dueTo))
		}

		const whereClause = and(...conditions)

		const orderClause = sortBy
			? sortDirection === 'asc'
				? sortBy === 'dueDate'
					? asc(deadlines.dueDate)
					: sortBy === 'priority'
						? asc(deadlines.priority)
						: asc(deadlines.createdAt)
				: sortBy === 'dueDate'
					? desc(deadlines.dueDate)
					: sortBy === 'priority'
						? desc(deadlines.priority)
						: desc(deadlines.createdAt)
			: desc(deadlines.dueDate)

		const rows = await db
			.select()
			.from(deadlines)
			.where(whereClause)
			.orderBy(orderClause)
			.limit(perPage)
			.offset((page - 1) * perPage)

		const [{ value: total }] = await db
			.select({ value: count() })
			.from(deadlines)
			.where(whereClause)

		return { data: rows, total }
	} catch (error) {
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Unknown error',
			total: null,
		}
	}
}
