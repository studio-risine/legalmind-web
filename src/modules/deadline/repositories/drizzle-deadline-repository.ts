import { db } from '@infra/db'
import {
	type Deadline,
	deadlines,
	type InsertDeadline,
} from '@infra/db/schemas'
import {
	and,
	between,
	count,
	eq,
	gte,
	ilike,
	isNull,
	lte,
	sql,
} from 'drizzle-orm'
import type {
	DeadlineRepository,
	DeleteDeadlineParams,
	ListDeadlinesParams,
	UpdateDeadlineParams,
} from './deadline-repository'

export class DrizzleDeadlineRepository implements DeadlineRepository {
	async insert(input: InsertDeadline): Promise<{ deadlineId: string }> {
		const [deadline] = await db
			.insert(deadlines)
			.values({
				dueDate: input.dueDate,
				notes: input.notes,
				priority: input.priority,
				processId: input.processId,
				spaceId: input.spaceId,
				status: input.status,
			})
			.returning({ id: deadlines.id })

		return {
			deadlineId: deadline.id,
		}
	}

	async findById(params: {
		id: string
		spaceId: string
	}): Promise<Deadline | undefined> {
		const deadline = await db.query.deadlines.findFirst({
			where: (deadlines, { eq, and, isNull }) =>
				and(
					eq(deadlines.id, params.id),
					eq(deadlines.spaceId, params.spaceId),
					isNull(deadlines.deletedAt),
				),
		})

		return deadline
	}

	async list(params: ListDeadlinesParams): Promise<{
		deadlines: Deadline[]
		total: number
	}> {
		const limit = params.limit ?? 25
		const offset = params.offset ?? 0

		const conditions = [
			eq(deadlines.spaceId, params.spaceId),
			isNull(deadlines.deletedAt),
		]

		if (params.search) {
			conditions.push(ilike(deadlines.notes, `%${params.search}%`)!)
		}

		if (params.status) {
			conditions.push(eq(deadlines.status, params.status))
		}

		if (params.priority) {
			conditions.push(eq(deadlines.priority, params.priority))
		}

		if (params.processId) {
			conditions.push(eq(deadlines.processId, params.processId))
		}

		if (params.dueDateFrom && params.dueDateTo) {
			conditions.push(
				between(deadlines.dueDate, params.dueDateFrom, params.dueDateTo),
			)
		} else if (params.dueDateFrom) {
			conditions.push(gte(deadlines.dueDate, params.dueDateFrom))
		} else if (params.dueDateTo) {
			conditions.push(lte(deadlines.dueDate, params.dueDateTo))
		}

		const whereClause = and(...conditions)

		const [deadlinesResult, [{ total }]] = await Promise.all([
			db
				.select()
				.from(deadlines)
				.where(whereClause)
				.limit(limit)
				.offset(offset)
				.orderBy(sql`${deadlines.dueDate} ASC`),
			db.select({ total: count() }).from(deadlines).where(whereClause),
		])

		return {
			deadlines: deadlinesResult,
			total: Number(total),
		}
	}

	async update(params: UpdateDeadlineParams): Promise<{ deadlineId: string }> {
		const [deadline] = await db
			.update(deadlines)
			.set({
				...params.data,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(deadlines.id, params.id),
					eq(deadlines.spaceId, params.spaceId),
					isNull(deadlines.deletedAt),
				),
			)
			.returning({ id: deadlines.id })

		return {
			deadlineId: deadline.id,
		}
	}

	async delete(params: DeleteDeadlineParams): Promise<void> {
		await db
			.update(deadlines)
			.set({
				deletedAt: new Date(),
			})
			.where(
				and(
					eq(deadlines.id, params.id),
					eq(deadlines.spaceId, params.spaceId),
					isNull(deadlines.deletedAt),
				),
			)
	}
}
