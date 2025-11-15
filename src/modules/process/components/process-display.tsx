'use server'

import { getSpaceIdFromHeaders } from '@modules/space/http/get-space-id-headers'
import { queryProcesses } from '../actions'
import { DataTableProcess, type DataTableRows } from './data-table-process'

interface ProcessDisplayProps {
	search?: string
	pageSize?: number
	page?: number
}

export async function ProcessDisplay({ search, page, pageSize }: ProcessDisplayProps) {
	const spaceId = await getSpaceIdFromHeaders()

	if (!spaceId) {
		throw new Error('Space ID is required')
	}

	const { data: processes } = await queryProcesses({
		page,
		pageSize,
		searchQuery: search,
		spaceId,
	})

	const resultProcesses = processes?.rows ?? []
	const total = processes?.total ?? 0

	const rows: DataTableRows[] = resultProcesses.map((process) => ({
		createdAt: process.createdAt,
		id: process._id,
		processNumber: process.processNumber,
		status: process.status,
		title: process.title,
		updatedAt: process.updatedAt,
	}))

	return <DataTableProcess rows={rows} total={total} />
}
