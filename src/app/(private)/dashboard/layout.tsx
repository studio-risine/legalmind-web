import DashboardLayout from '@modules/dashboard/layouts/layout'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return <DashboardLayout>{children}</DashboardLayout>
}
