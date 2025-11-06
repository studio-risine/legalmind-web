import type {
	Client,
	ClientStatus,
	ClientTypes,
	InsertClient,
	UpdateClient,
} from '@infra/db/schemas'

export type FindById = {
	id: string
	spaceId: string
}

export type FindManyParams = {
	spaceId: string
	limit?: number
	offset?: number
	search?: string
	status?: ClientStatus
	type?: ClientTypes
}

export type UpdateClientParams = {
	id: string
	spaceId: string
	data: UpdateClient
}

export type DeleteClientParams = {
	id: string
	spaceId: string
}

export interface ClientRepository {
	insert(params: InsertClient): Promise<{ clientId: string }>
	findById(params: FindById): Promise<Client | undefined>
	findMany(params: FindManyParams): Promise<{ data: Client[]; total: number }>
	update(params: UpdateClientParams): Promise<{ clientId: string }>
	delete(params: DeleteClientParams): Promise<void>
}
