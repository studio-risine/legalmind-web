'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/infra/db'
import { clients } from '@/infra/db/schemas/clients'

const deleteClientInput = z.object({ id: z.string().min(1) })

export interface DeleteClientOutput {
	success: boolean
	error?: string
}

export async function deleteClientAction(
	input: z.infer<typeof deleteClientInput>,
): Promise<DeleteClientOutput> {
	const { id } = deleteClientInput.parse(input)

	try {
		const result = await db
			.delete(clients)
			.where(eq(clients.id, id))
			.returning()
		if (!result || result.length === 0) {
			return { success: false, error: 'Client not found' }
		}

		return { success: true }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
