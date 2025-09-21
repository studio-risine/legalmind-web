import type { ReactNode } from 'react'
import AppLayout from '@/modules/dashboard/layouts/layout'

export default function Layout({ children }: { children: ReactNode }) {
	return <AppLayout>{children}</AppLayout>
}
