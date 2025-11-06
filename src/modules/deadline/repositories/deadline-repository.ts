import type { Deadline, InsertDeadline } from '@infra/db/schemas'

export type ListDeadlinesParams = {
	spaceId: string
	limit?: number
	offset?: number
	search?: string
	status?: 'OPEN' | 'DONE' | 'CANCELED'
	priority?: 'LOW' | 'MEDIUM' | 'HIGH'
	processId?: string
	dueDateFrom?: Date
	dueDateTo?: Date
}

export type UpdateDeadlineParams = {
	id: string
	spaceId: string
	data: Partial<InsertDeadline>
}

export type DeleteDeadlineParams = {
	id: string
	spaceId: string
}

export interface DeadlineRepository {
	insert(data: InsertDeadline): Promise<{ deadlineId: string }>
	findById(params: {
		id: string
		spaceId: string
	}): Promise<Deadline | undefined>
	list(params: ListDeadlinesParams): Promise<{
		deadlines: Deadline[]
		total: number
	}>
	update(params: UpdateDeadlineParams): Promise<{ deadlineId: string }>
	delete(params: DeleteDeadlineParams): Promise<void>
}
