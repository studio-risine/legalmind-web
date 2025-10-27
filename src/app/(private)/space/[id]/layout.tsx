import { AppSidebar } from '@components/ui/app-sidebar'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import { notFound } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'

interface LayoutProps {
	children: ReactNode
	params: Promise<{ id: string }>
}

export default async function Layout({ children, params }: LayoutProps) {
	const { id: spaceId } = await params

	if (!spaceId) notFound()

	return (
		<SidebarProvider>
			<div className="relative flex h-screen w-full">
				<AppSidebar spaceId={spaceId} />
				<SidebarInset className="flex flex-col">
					<NuqsAdapter>{children}</NuqsAdapter>
				</SidebarInset>
			</div>
		</SidebarProvider>
	)
}
