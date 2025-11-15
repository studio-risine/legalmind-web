'use server'

import { getSpaceIdFromHeaders } from '@modules/space/http/get-space-id-headers'

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
}

export async function getSpaceId(): Promise<Output> {
	const spaceId = await getSpaceIdFromHeaders()

	if (!spaceId) {
		return {
			data: null,
			message: 'Space ID não encontrado nos headers',
			success: false,
		}
	}

	return {
		data: spaceId,
		message: 'Space ID encontrado com sucesso',
		success: true,
	}
}
