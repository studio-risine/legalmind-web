import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@components/ui/breadcrumb'
import type { ReactNode } from 'react'

interface HeaderBreadcrumbProps {
	items: {
		label: string
		href: string
	}[]
	children?: ReactNode
}

export function HeaderBreadcrumb({ items }: HeaderBreadcrumbProps) {
	return (
		<div className="flex h-12 items-center justify-between border-b px-4 py-2">
			<Breadcrumb>
				<BreadcrumbList>
					{items.map((item, index) => {
						const isLastItem = index === items.length - 1

						return isLastItem ? (
							<BreadcrumbItem key={item.href}>
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							</BreadcrumbItem>
						) : (
							<div className="flex items-center gap-2" key={item.href}>
								<BreadcrumbItem>
									<BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
							</div>
						)
					})}
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	)
}
