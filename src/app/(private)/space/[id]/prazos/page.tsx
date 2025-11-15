import { MainContent } from '@components/ui/main-content'
import { listDeadlinesAction } from '@modules/deadline/actions'
import { DataTableDeadlines } from '@modules/deadline/components/data-table-deadlines'
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
		priority?: string
		processId?: string
	}>
}) {
	const { id: spaceId } = await params
	const {
		page = '1',
		perPage = '25',
		search,
		status,
		priority,
		processId,
	} = await searchParams

	const limit = Number.parseInt(perPage, 10)
	const offset = (Number.parseInt(page, 10) - 1) * limit

	const { data } = await listDeadlinesAction({
		limit,
		offset,
		priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
		processId,
		search,
		spaceId,
		status: status as 'OPEN' | 'DONE' | 'CANCELED',
	})

	const breadcrumb = [
		{ href: `/space/${spaceId}`, label: 'Meu Space' },
		{ href: `/space/${spaceId}/prazos`, label: 'Prazos' },
	]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="2xl">
				<div className="space-y-6">
					<div>
						<h1 className="font-bold text-2xl text-foreground">Prazos</h1>
						<p className="text-muted-foreground">
							Gerencie seus prazos processuais
						</p>
					</div>

					{data && (
						<DataTableDeadlines data={data.deadlines} total={data.total} />
					)}
				</div>
			</MainContent>
		</>
	)
}
