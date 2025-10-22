import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'
import { DataTableProcesses, getProcessesAction } from '@modules/process'
import { Stats } from '@modules/process/components/stats-view'

const breadcrumb = [
	{ label: 'Home', href: '/dashboard' },
	{ label: 'Processes', href: '/dashboard/processes' },
]

export default async function Page() {
	const { data, total } = await getProcessesAction({
		page: 1,
		perPage: 1,
		searchQuery: '',
	})

	console.log('Total processes:', total ?? 0)
	console.log('Sample process data:', data ?? [])

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="2xl">
				<Stats />
				<DataTableProcesses data={[]} total={total || 0} />
			</MainContent>
		</>
	)
}
