import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@components/ui/breadcrumb'
import type { ReactNode } from 'react'

interface PageHeaderBreadcrumbProps {
	breadcrumb: {
		label: string
		href: string
	}[]
	children?: ReactNode
}

export function PageHeaderWithBreadcrumb({
	breadcrumb,
	children,
}: PageHeaderBreadcrumbProps) {
	return (
		<div className="flex h-12 items-center justify-between border-b px-4 py-2">
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
