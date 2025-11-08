import { db } from '@infra/db'
import {
	deadlines,
	type InsertProcess,
	type Process,
	processes,
	type SpaceId,
} from '@infra/db/schemas'
import { and, asc, count, desc, eq, ilike, isNull, or } from 'drizzle-orm'
import type {
	DeleteProcessParams,
	FindManyParams,
	ProcessRepository,
	UpdateProcessParams,
} from './process-repository'

export class DrizzleProcessRepository implements ProcessRepository {
	async insert(params: InsertProcess): Promise<{ processId: string }> {
		const [result] = await db
			.insert(processes)
			.values(params)
			.returning({ id: processes.id })

		return {
			processId: result.id,
		}
	}
	async findById(params: {
		id: string
		spaceId: SpaceId
	}): Promise<Process | undefined> {
		const result = await db.query.processes.findFirst({
			where: (tbl, { and, eq, isNull }) =>
				and(
					eq(tbl.id, params.id),
					eq(tbl.spaceId, params.spaceId),
					isNull(tbl.deletedAt),
				),
		})
		return result
	}
	async update(params: UpdateProcessParams): Promise<{ processId: string }> {
		const now = new Date()

		const [updated] = await db
			.update(processes)
			.set({ ...params.data, updatedAt: now })
			.where(
				and(
					eq(processes.id, params.id),
					eq(processes.spaceId, params.spaceId),
					isNull(processes.deletedAt),
				),
			)
			.returning({ id: processes.id })

		return { processId: updated.id }
	}
	async delete(params: DeleteProcessParams): Promise<void> {
		const now = new Date()

		await db.transaction(async (tx) => {
			await tx
				.update(deadlines)
				.set({ deletedAt: now })
				.where(
					and(
						eq(deadlines.spaceId, params.spaceId),
						eq(deadlines.processId, params.id),
						isNull(deadlines.deletedAt),
					),
				)

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
	async findMany(
		params: FindManyParams,
	): Promise<{ data: Process[]; total: number }> {
		const page = params.page ?? 1
		const pageSize = params.pageSize ?? 10
		const { searchQuery, sortBy, sortDirection } = params

		const conditions = [
			eq(processes.spaceId, params.spaceId),
			isNull(processes.deletedAt),
		]

		if (searchQuery) {
			conditions.push(
				or(
					ilike(processes.title, `%${searchQuery}%`),
					ilike(processes.processNumber, `%${searchQuery}%`),
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

		const [result, [{ total }]] = await Promise.all([
			db
				.select({
					id: processes.id,
					spaceId: processes.spaceId,
					clientId: processes.clientId,
					title: processes.title,
					description: processes.description,
					processNumber: processes.processNumber,
					status: processes.status,
					assignedId: processes.assignedId,
					createdBy: processes.createdBy,
					createdAt: processes.createdAt,
					updatedAt: processes.updatedAt,
					deletedAt: processes.deletedAt,
				})
				.from(processes)
				.where(whereClause)
				.orderBy((fields) => {
					if (sortBy && sortDirection === 'asc') {
						return asc(fields[sortBy])
					}

					if (sortBy && sortDirection === 'desc') {
						return desc(fields[sortBy])
					}

					return desc(fields.createdAt)
				})
				.offset((page - 1) * pageSize)
				.limit(pageSize),
			db
				.select({ total: count(processes.id) })
				.from(processes)
				.where(whereClause),
		])

		return {
			data: result,
			total,
		}
	}
}
