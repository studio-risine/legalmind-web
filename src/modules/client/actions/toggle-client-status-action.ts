'use server'

import { db } from '@infra/db'
import { type Client, clients } from '@infra/db/schemas/clients'
import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

const toggleClientStatusInput = z.object({
	id: z.string().min(1),
	status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
})

export type ToggleClientStatusInput = z.infer<typeof toggleClientStatusInput>

export interface ToggleClientStatusOutput {
	success: boolean
	data?: Client
	error?: string
}

export async function toggleClientStatusAction(
	input: ToggleClientStatusInput,
): Promise<ToggleClientStatusOutput> {
	const parsed = toggleClientStatusInput.safeParse(input)
	if (!parsed.success) {
		return { success: false, error: parsed.error.message }
	}

	try {
		const { id, status } = parsed.data
		const [row] = await db
			.update(clients)
			.set({ status })
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
