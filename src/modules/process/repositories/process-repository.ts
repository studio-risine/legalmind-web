import type {
	InsertProcess,
	Process,
	ProcessStatus,
	SpaceId,
	UpdateProcess,
} from '@infra/db/schemas'

export type FindManyParams = {
	spaceId: SpaceId
	page?: number
	pageSize?: number
	searchQuery?: string
	sortBy?: 'createdAt'
	sortDirection?: 'asc' | 'desc'
	status?: ProcessStatus
	clientId?: string
	assignedId?: string
}

export type UpdateProcessParams = {
	id: string
	spaceId: SpaceId
	data: UpdateProcess
}

export type DeleteProcessParams = {
	id: string
	spaceId: string
}

type FindByIdParams = {
	id: string
	spaceId: SpaceId
}

export interface ProcessRepository {
	insert(params: InsertProcess): Promise<{ processId: string }>
	findById(params: FindByIdParams): Promise<{ data: Process | undefined }>
	findMany(params: FindManyParams): Promise<{ data: Process[]; total: number }>
	update(params: UpdateProcessParams): Promise<{ processId: string }>
	delete(params: DeleteProcessParams): Promise<void>
}
