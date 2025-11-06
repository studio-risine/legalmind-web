import type { InsertProcess, Process } from '@infra/db/schemas'

export type ListProcessesParams = {
	spaceId: string
	limit?: number
	offset?: number
	search?: string
	status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'CLOSED'
	clientId?: string
	assignedId?: string
}

export type UpdateProcessParams = {
	id: string
	spaceId: string
	data: Partial<InsertProcess>
}

export type DeleteProcessParams = {
	id: string
	spaceId: string
}

export interface ProcessRepository {
	insert(data: InsertProcess): Promise<{ processId: string }>
	findById(params: {
		id: string
		spaceId: string
	}): Promise<Process | undefined>
	list(params: ListProcessesParams): Promise<{
		processes: Process[]
		total: number
	}>
	update(params: UpdateProcessParams): Promise<{ processId: string }>
	delete(params: DeleteProcessParams): Promise<void>
}
