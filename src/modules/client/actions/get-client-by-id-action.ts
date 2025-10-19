'use server'

import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { db } from '@/infra/db'
import { type Client, clients } from '@/infra/db/schemas/clients'

const getClientByIdInput = z.object({ id: z.string().min(1) })

export async function getClientByIdAction(
	input: z.infer<typeof getClientByIdInput>,
): Promise<Client | null> {
	const { id } = getClientByIdInput.parse(input)

	const [row] = await db
		.select()
		.from(clients)
		.where(eq(clients.id, id))
		.limit(1)

	if (!row) return null

	const clientSelectSchema = createSelectSchema(clients)
	return clientSelectSchema.parse(row)
}
