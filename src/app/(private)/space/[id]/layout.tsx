import { AppSidebar } from '@components/ui/app-sidebar'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import { getSpaceIdFromHeaders } from '@libs/http/space'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'

interface LayoutProps {
	children: ReactNode
}

export default async function Layout({ children }: LayoutProps) {
	const spaceId = await getSpaceIdFromHeaders()

	if (!spaceId) {
		throw new Error('Space ID is required in layout')
	}

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
