import { AppSidebar } from '@components/ui/app-sidebar'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import { redirect } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'

interface SpaceLayoutProps {
	children: ReactNode
	spaceId: string
}

export default async function SpaceLayout({ spaceId, children }: SpaceLayoutProps) {

	return (
		<SidebarProvider>
			<div className="relative flex h-screen w-full">
				<AppSidebar spaceId={spaceId} />
				<SidebarInset className="flex flex-col">
					<NuqsAdapter>
						{children}
					</NuqsAdapter>
				</SidebarInset>
			</div>
		</SidebarProvider>
	)
}
