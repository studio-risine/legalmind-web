import { RiUserAddLine } from '@remixicon/react'
import { Button } from '@/components/ui/button'
import { CustomersDataTable } from '@/modules/customer/components'
import { PageHeaderWithBreadcrumb } from '@/modules/dashboard/components/page-header-breadcrumb'

const breadcrumb = [
	{ label: 'Home', href: '/dashboard' },
	{ label: 'Customer', href: '/dashboard/customer' },
]

export default function Page() {
	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb}>
				<Button size="sm">
					<RiUserAddLine size={16} />
					New Customer
				</Button>
			</PageHeaderWithBreadcrumb>
			<div className="flex flex-col px-6">
				<CustomersDataTable />
			</div>
		</>
	)
}
