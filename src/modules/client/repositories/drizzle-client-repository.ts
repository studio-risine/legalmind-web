import { db } from '@infra/db'
import {
	type Client,
	clients,
	deadlines,
	type InsertClient,
	processes,
} from '@infra/db/schemas'
import { and, count, eq, ilike, isNull, or, sql } from 'drizzle-orm'
import type {
	ClientRepository,
	DeleteClientParams,
	FindManyParams,
	UpdateClientParams,
} from './client-repository'

export class DrizzleClientRepository implements ClientRepository {
	async insert(input: InsertClient): Promise<{ clientId: string }> {
		const [client] = await db
			.insert(clients)
			.values({
				documentNumber: input.documentNumber,
				email: input.email,
				name: input.name,
				phoneNumber: input.phoneNumber,
				spaceId: input.spaceId,
				status: input.status,
				type: input.type,
			})
			.returning({ id: clients.id })

		return {
			clientId: client.id,
		}
	}

	async findById(params: {
		id: string
		spaceId: string
	}): Promise<Client | undefined> {
		const client = await db.query.clients.findFirst({
			where: (clients, { eq, and, isNull }) =>
				and(
					eq(clients.id, params.id),
					eq(clients.spaceId, params.spaceId),
					isNull(clients.deletedAt),
				),
		})

		return client
	}

	async findMany(params: FindManyParams): Promise<{
		data: Client[]
		total: number
	}> {
		const limit = params.limit ?? 25
		const offset = params.offset ?? 0

		const conditions = [
			eq(clients.spaceId, params.spaceId),
			isNull(clients.deletedAt),
		]

		if (params.search) {
			conditions.push(
				or(
					ilike(clients.name, `%${params.search}%`),
					ilike(clients.email, `%${params.search}%`),
					ilike(clients.documentNumber, `%${params.search}%`),
				)!,
			)
		}

		if (params.status) {
			conditions.push(eq(clients.status, params.status))
		}

		if (params.type) {
			conditions.push(eq(clients.type, params.type))
		}

		const queryConditions = and(...conditions)

		const [result, [{ total }]] = await Promise.all([
			db
				.select()
				.from(clients)
				.where(queryConditions)
				.limit(limit)
				.offset(offset)
				.orderBy(sql`${clients.createdAt} DESC`),
			db.select({ total: count() }).from(clients).where(queryConditions),
		])

		return {
			data: result,
			total: Number(total),
		}
	}

	async update(params: UpdateClientParams): Promise<{ clientId: string }> {
		const [client] = await db
			.update(clients)
			.set({
				...params.data,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(clients.id, params.id),
					eq(clients.spaceId, params.spaceId),
					isNull(clients.deletedAt),
				),
			)
			.returning({ id: clients.id })

		return {
			clientId: client.id,
		}
	}

	async delete(params: DeleteClientParams): Promise<void> {
		const now = new Date()

		// Soft-delete cascade: Client → Processes → Deadlines
		await db.transaction(async (tx) => {
			// 1. Find all processes for this client
			const clientProcesses = await tx
				.select({ id: processes.id })
				.from(processes)
				.where(
					and(
						eq(processes.clientId, params.id),
						eq(processes.spaceId, params.spaceId),
						isNull(processes.deletedAt),
					),
				)

			const processIds = clientProcesses.map((process) => process.id)

			// 2. Soft-delete all deadlines for these processes
			if (processIds.length > 0) {
				await tx
					.update(deadlines)
					.set({ deletedAt: now })
					.where(
						and(
							eq(deadlines.spaceId, params.spaceId),
							isNull(deadlines.deletedAt),

							or(...processIds.map((id) => eq(deadlines.processId, id))),
						),
					)

				// 3. Soft-delete all processes
				await tx
					.update(processes)
					.set({ deletedAt: now })
					.where(
						and(
							eq(processes.clientId, params.id),
							eq(processes.spaceId, params.spaceId),
							isNull(processes.deletedAt),
						),
					)
			}

			// 4. Soft-delete the client
			await tx
				.update(clients)
				.set({ deletedAt: now })
				.where(
					and(
						eq(clients.id, params.id),
						eq(clients.spaceId, params.spaceId),
						isNull(clients.deletedAt),
					),
				)
		})
	}
}
