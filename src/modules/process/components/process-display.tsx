'use server'

import { getSpaceIdFromHeaders } from '@modules/space/http/get-space-id-headers'
import { queryProcesses } from '../actions'
import { DataTableProcess, type DataTableRows } from './data-table-process'

interface ProcessDisplayProps {
	search?: string
	pageSize?: number
	page?: number
}

export async function ProcessDisplay({
	search,
	page,
	pageSize,
}: ProcessDisplayProps) {
	const spaceId = await getSpaceIdFromHeaders()

	if (!spaceId) {
		throw new Error('Space ID is required')
	}

	const { data: processes } = await queryProcesses({
		searchQuery: search,
		spaceId,
		pageSize,
		page,
	})

	const resultProcesses = processes?.rows ?? []
	const total = processes?.total ?? 0

	const rows: DataTableRows[] = resultProcesses.map((process) => ({
		id: process.id,
		processNumber: process.processNumber,
		title: process.title,
		status: process.status,
		createdAt: process.createdAt,
		updatedAt: process.updatedAt,
	}))

	return <DataTableProcess rows={rows} total={total} />
}
