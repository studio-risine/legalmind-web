import { Button } from '@/components/ui/button'
import { PageHeaderWithBreadcrumb } from '@/modules/dashboard/components/page-header-breadcrumb'

const breadcrumb = [
	{ label: 'Home', href: '/dashboard' },
	{ label: 'Processes', href: '/dashboard/processes' },
]

export default function Page() {
	return (
		<PageHeaderWithBreadcrumb breadcrumb={breadcrumb}>
			<Button size="sm">New Process</Button>
		</PageHeaderWithBreadcrumb>
	)
}
