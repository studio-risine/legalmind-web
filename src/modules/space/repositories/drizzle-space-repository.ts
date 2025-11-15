import { db } from '@infra/db'
import {
	type InsertSpace,
	type Space,
	spaces,
	spacesToAccounts,
} from '@infra/db/schemas'
import { eq } from 'drizzle-orm'
import type { SpaceRepository } from './space-repository'

export class DrizzleSpaceRepository implements SpaceRepository {
	async insert(input: InsertSpace): Promise<{ spaceId: string }> {
		const result = await db.transaction(async (tx) => {
			const [space] = await tx
				.insert(spaces)
				.values({
					createdBy: input.createdBy,
					name: input.name,
					type: input.type,
				})
				.returning({ id: spaces.id })

			await tx.insert(spacesToAccounts).values({
				accountId: input.createdBy,
				spaceId: space.id,
			})

			return space
		})

		return {
			spaceId: result.id,
		}
	}

	async findById({ id }: { id: string }): Promise<Space | undefined> {
		const space = await db.query.spaces.findFirst({
			where: (spaces, { eq }) => eq(spaces.id, id),
		})

		return space
	}

	async findByAccountId({
		accountId,
	}: {
		accountId: string
	}): Promise<Space | undefined> {
		const result = await db
			.select({
				createdAt: spaces.createdAt,
				createdBy: spaces.createdBy,
				id: spaces.id,
				name: spaces.name,
				type: spaces.type,
				updatedAt: spaces.updatedAt,
			})
			.from(spaces)
			.innerJoin(spacesToAccounts, eq(spaces.id, spacesToAccounts.spaceId))
			.where(eq(spacesToAccounts.accountId, accountId))
			.limit(1)

		return result[0]
	}
}
