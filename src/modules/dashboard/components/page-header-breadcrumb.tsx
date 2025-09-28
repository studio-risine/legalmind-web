import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface PageHeaderBreadcrumbProps {
	breadcrumb: {
		label: string
		href: string
	}[]
	children?: React.ReactNode
}

export function PageHeaderWithBreadcrumb({
	breadcrumb,
	children,
}: PageHeaderBreadcrumbProps) {
	return (
		<div className="flex justify-between px-1">
			<Breadcrumb>
				<BreadcrumbList>
					{breadcrumb.map((item, index) => {
						const isLastItem = index === breadcrumb.length - 1

						return isLastItem ? (
							<BreadcrumbItem key={item.href}>
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							</BreadcrumbItem>
						) : (
							<div key={item.href} className="flex items-center gap-2">
								<BreadcrumbItem>
									<BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
							</div>
						)
					})}
				</BreadcrumbList>
			</Breadcrumb>

			<div>{children}</div>
		</div>
	)
}
