'use server'

import { eq } from 'drizzle-orm'
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { z } from 'zod'
import { db } from '@/infra/db'
import { type Client, clients } from '@/infra/db/schemas/clients'

const clientUpdateDataSchema = createUpdateSchema(clients).pick({
	name: true,
	email: true,
	phone: true,
})

const clientUpdateSchema = z
	.object({ id: z.string().min(1) })
	.merge(clientUpdateDataSchema)

export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>

export interface UpdateClientOutput {
	success: boolean
	data?: Client
	error?: string
}

export async function updateClientAction(
	input: ClientUpdateInput,
): Promise<UpdateClientOutput> {
	const parsed = clientUpdateSchema.safeParse(input)
	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const { id, ...updateData } = parsed.data

		const [row] = await db
			.update(clients)
			.set(updateData)
			.where(eq(clients.id, id))
			.returning()

		if (!row) {
			return { success: false, error: 'Client not found' }
		}

		const clientSelectSchema = createSelectSchema(clients)
		const data = clientSelectSchema.parse(row)

		return { success: true, data }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
