import { getClientsAction } from '@modules/client/actions/get-clients-action'
import { DataTableClients } from '@modules/client/components'
import { PageHeaderWithBreadcrumb } from '@modules/dashboard/components/page-header-breadcrumb'
import type { SearchParams } from 'nuqs'
import { loadSearchParams } from './search-params'

const breadcrumb = [
	{ label: 'Home', href: '/dashboard' },
	{ label: 'Clients', href: '/dashboard/clients' },
]

type PageProps = {
	searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: PageProps) {
	const { name, page, perPage } = await loadSearchParams(searchParams)

	const { data, total } = await getClientsAction({
		searchQuery: name ?? undefined,
		page,
		perPage,
		sortBy: 'created_at',
		sortDirection: 'desc',
	})

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<div className="flex flex-col px-6">
				<DataTableClients data={data || []} total={total || 0} />
			</div>
		</>
	)
}
