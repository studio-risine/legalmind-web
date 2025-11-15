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
		const [result] = await db.insert(processes).values(params).returning({ id: processes._id })

		return {
			processId: result.id,
		}
	}
	async findById(params: { id: string; spaceId: SpaceId }): Promise<{ data: Process | undefined }> {
		const result = await db.query.processes.findFirst({
			where: (entityTable, { and, eq, isNull }) =>
				and(
					eq(entityTable._id, params.id),
					eq(entityTable.spaceId, params.spaceId),
					isNull(entityTable.deletedAt),
				),
		})

		return {
			data: result,
		}
	}
	async update(params: UpdateProcessParams): Promise<{ processId: string }> {
		const now = new Date()

		const [updated] = await db
			.update(processes)
			.set({ ...params.data, updatedAt: now })
			.where(
				and(
					eq(processes._id, params.id),
					eq(processes.spaceId, params.spaceId),
					isNull(processes.deletedAt),
				),
			)
			.returning({ id: processes._id })

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
						eq(processes._id, params.id),
						eq(processes.spaceId, params.spaceId),
						isNull(processes.deletedAt),
					),
				)
		})
	}
	async findMany(params: FindManyParams): Promise<{ data: Process[]; total: number }> {
		const page = params.page ?? 1
		const pageSize = params.pageSize ?? 10
		const { searchQuery, sortBy, sortDirection } = params

		const conditions = [eq(processes.spaceId, params.spaceId), isNull(processes.deletedAt)]

		if (searchQuery) {
			conditions.push(
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
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
					_id: processes._id,
					assignedId: processes.assignedId,
					clientId: processes.clientId,
					court: processes.court,
					courtClass: processes.courtClass,
					createdAt: processes.createdAt,
					createdBy: processes.createdBy,
					deletedAt: processes.deletedAt,
					description: processes.description,
					partiesSummary: processes.partiesSummary,
					phase: processes.phase,
					processNumber: processes.processNumber,
					spaceId: processes.spaceId,
					status: processes.status,
					title: processes.title,
					updatedAt: processes.updatedAt,
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
				.select({ total: count(processes._id) })
				.from(processes)
				.where(whereClause),
		])

		return {
			data: result,
			total,
		}
	}
}
