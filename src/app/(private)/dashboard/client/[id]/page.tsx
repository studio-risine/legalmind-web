import { PageHeaderWithBreadcrumb } from '@/modules/dashboard/components/page-header-breadcrumb'

const breadcrumb = [
	{ label: 'Home', href: '/dashboard' },
	{ label: 'Clients', href: '/dashboard/client' },
	{ label: 'Client', href: '/dashboard/client/[id]' },
]

export default function Page() {
	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<div className="flex flex-col px-6" />
		</>
	)
}
