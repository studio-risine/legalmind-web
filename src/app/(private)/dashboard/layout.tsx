import type { ReactNode } from 'react'
import DashboardLayout from '@/modules/dashboard/layouts/layout'

export default function Layout({ children }: { children: ReactNode }) {
	return <DashboardLayout>{children}</DashboardLayout>
}
