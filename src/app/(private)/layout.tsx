import AppLayout from '@modules/app/layout/app-layout'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return <AppLayout>{children}</AppLayout>
}
