import { AppSidebar } from '@components/ui/app-sidebar'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import { redirect } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'

interface SpaceLayoutProps {
	children: ReactNode
	params: Promise<{ id: string }>
}

export default async function SpaceIdLayout({
	children,
	params,
}: SpaceLayoutProps) {
	const { id: spaceId } = await params

	if (!spaceId) {
		redirect('/error?reason=missing-space-id')
	}

	return (
		<SidebarProvider>
			<div className="relative flex h-screen w-full">
				<AppSidebar spaceId={spaceId} />
				<SidebarInset className="flex flex-col">
					<NuqsAdapter>
						<div className="flex flex-col gap-4">{children}</div>
					</NuqsAdapter>
				</SidebarInset>
			</div>
		</SidebarProvider>
	)
}
