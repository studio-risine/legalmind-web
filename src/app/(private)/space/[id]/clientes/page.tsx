import { MainContent } from '@components/ui/main-content'
import { listClientsAction } from '@modules/client/actions'
import { DataTableClients } from '@modules/client/components/data-table-clients'
import { HeaderBreadcrumb } from '@modules/space/components'

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<{
		page?: string
		perPage?: string
		search?: string
		status?: string
		type?: string
	}>
}) {
	const { id: spaceId } = await params
	const {
		page = '1',
		perPage = '25',
		search,
		status,
		type,
	} = await searchParams

	const limit = Number.parseInt(perPage, 10)
	const offset = (Number.parseInt(page, 10) - 1) * limit

	const { data } = await listClientsAction({
		limit,
		offset,
		search,
		spaceId,
		status: status as 'LEAD' | 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
		type: type as 'INDIVIDUAL' | 'COMPANY',
	})

	const breadcrumb = [
		{ href: `/space/${spaceId}`, label: 'Meu Space' },
		{
			href: `/space/${spaceId}/clientes`,
			label: 'Clientes',
		},
	]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="2xl">
				<div className="space-y-6">
					<div>
						<h1 className="font-bold text-2xl text-foreground">Clientes</h1>
						<p className="text-muted-foreground">
							Gerencie seus clientes e prospectos
						</p>
					</div>

					{data && <DataTableClients data={data.clients} total={data.total} />}
				</div>
			</MainContent>
		</>
	)
}
