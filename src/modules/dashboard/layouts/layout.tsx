import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/modules/dashboard/components/app-sidebar'
import ProtectedGuard from '../../auth/components/protected-guard'

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<ProtectedGuard>
			<SidebarProvider>
				<div className="relative flex h-screen w-full">
					<DashboardSidebar />
					<SidebarInset className="flex flex-col">
						<NuqsAdapter>
							<div className="flex flex-col gap-4">{children}</div>
						</NuqsAdapter>
					</SidebarInset>
				</div>
			</SidebarProvider>
		</ProtectedGuard>
	)
}
