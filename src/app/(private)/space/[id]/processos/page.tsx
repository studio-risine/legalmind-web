import { MainContent } from '@components/ui/main-content'
import { listProcessesAction } from '@modules/process/actions'
import { DataTableProcesses } from '@modules/process/components/data-table-processes'
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
		clientId?: string
		assignedId?: string
	}>
}) {
	const { id: spaceId } = await params
	const {
		page = '1',
		perPage = '25',
		search,
		status,
		clientId,
		assignedId,
	} = await searchParams

	const limit = Number.parseInt(perPage, 10)
	const offset = (Number.parseInt(page, 10) - 1) * limit

	const { data } = await listProcessesAction({
		spaceId,
		limit,
		offset,
		search,
		status: status as
			| 'PENDING'
			| 'ACTIVE'
			| 'SUSPENDED'
			| 'ARCHIVED'
			| 'CLOSED',
		clientId,
		assignedId,
	})

	const breadcrumb = [
		{ label: 'Meu Space', href: `/space/${spaceId}` },
		{ label: 'Processos', href: `/space/${spaceId}/processos` },
	]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="2xl">
				<div className="space-y-6">
					<div>
						<h1 className="font-bold text-2xl text-foreground">Processos</h1>
						<p className="text-muted-foreground">
							Gerencie seus processos judiciais
						</p>
					</div>

					{data && (
						<DataTableProcesses data={data.processes} total={data.total} />
					)}
				</div>
			</MainContent>
		</>
	)
}
