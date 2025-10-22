import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'
import { SpaceSidebar } from '../components/app-sidebar'

export default function SpaceLayout({ children }: { children: ReactNode }) {
	return (
			<SidebarProvider>
				<div className="relative flex h-screen w-full">
					<SpaceSidebar />
					<SidebarInset className="flex flex-col">
						<NuqsAdapter>
							<div className="flex flex-col gap-4">{children}</div>
						</NuqsAdapter>
						{/* <OperationHost /> */}
					</SidebarInset>
				</div>
			</SidebarProvider>
	)
}
