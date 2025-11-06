import { db } from '@infra/db'
import {
	deadlines,
	type InsertProcess,
	type Process,
	processes,
} from '@infra/db/schemas'
import { and, count, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import type {
	DeleteProcessParams,
	ListProcessesParams,
	ProcessRepository,
	UpdateProcessParams,
} from './process-repository'

export class DrizzleProcessRepository implements ProcessRepository {
	async insert(input: InsertProcess): Promise<{ processId: string }> {
		const [process] = await db
			.insert(processes)
			.values({
				spaceId: input.spaceId,
				clientId: input.clientId,
				title: input.title,
				description: input.description,
				processNumber: input.processNumber,
				status: input.status,
				assignedId: input.assignedId,
				createdBy: input.createdBy,
			})
			.returning({ id: processes.id })

		return {
			processId: process.id,
		}
	}

	async findById(params: {
		id: string
		spaceId: string
	}): Promise<Process | undefined> {
		const process = await db.query.processes.findFirst({
			where: (processes, { eq, and, isNull }) =>
				and(
					eq(processes.id, params.id),
					eq(processes.spaceId, params.spaceId),
					isNull(processes.deletedAt),
				),
		})

		return process
	}

	async list(params: ListProcessesParams): Promise<{
		processes: Process[]
		total: number
	}> {
		const limit = params.limit ?? 25
		const offset = params.offset ?? 0

		const conditions = [
			eq(processes.spaceId, params.spaceId),
			isNull(processes.deletedAt),
		]

		if (params.search) {
			conditions.push(
				or(
					ilike(processes.title, `%${params.search}%`),
					ilike(processes.processNumber, `%${params.search}%`),
					ilike(processes.description, `%${params.search}%`),
				)!,
			)
		}

		if (params.status) {
			conditions.push(eq(processes.status, params.status))
		}

		if (params.clientId) {
			conditions.push(eq(processes.clientId, params.clientId))
		}

		if (params.assignedId) {
			conditions.push(eq(processes.assignedId, params.assignedId))
		}

		const whereClause = and(...conditions)

		const [processesResult, [{ total }]] = await Promise.all([
			db
				.select()
				.from(processes)
				.where(whereClause)
				.limit(limit)
				.offset(offset)
				.orderBy(sql`${processes.createdAt} DESC`),
			db.select({ total: count() }).from(processes).where(whereClause),
		])

		return {
			processes: processesResult,
			total: Number(total),
		}
	}

	async update(params: UpdateProcessParams): Promise<{ processId: string }> {
		const [process] = await db
			.update(processes)
			.set({
				...params.data,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(processes.id, params.id),
					eq(processes.spaceId, params.spaceId),
					isNull(processes.deletedAt),
				),
			)
			.returning({ id: processes.id })

		return {
			processId: process.id,
		}
	}

	async delete(params: DeleteProcessParams): Promise<void> {
		const now = new Date()

		// Soft-delete cascade: Process → Deadlines
		await db.transaction(async (tx) => {
			// 1. Soft-delete all deadlines for this process
			await tx
				.update(deadlines)
				.set({ deletedAt: now })
				.where(
					and(
						eq(deadlines.processId, params.id),
						eq(deadlines.spaceId, params.spaceId),
						isNull(deadlines.deletedAt),
					),
				)

			// 2. Soft-delete the process
			await tx
				.update(processes)
				.set({ deletedAt: now })
				.where(
					and(
						eq(processes.id, params.id),
						eq(processes.spaceId, params.spaceId),
						isNull(processes.deletedAt),
					),
				)
		})
	}
}
