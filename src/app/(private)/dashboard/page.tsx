import { PageHeaderWithBreadcrumb } from '@modules/dashboard/components/page-header-breadcrumb'

const breadcrumb = [{ label: 'Home', href: '/dashboard' }]

export default function Page() {
	return <PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
}
