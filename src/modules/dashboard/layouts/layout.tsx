import type { ReactNode } from 'react'
import ProtectedGuard from '../../auth/components/protected-guard'

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return <ProtectedGuard>{children}</ProtectedGuard>
}
