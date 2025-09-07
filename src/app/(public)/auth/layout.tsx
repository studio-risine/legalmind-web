import AuthLayout from '@modules/auth/layout/auth-layout'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return <AuthLayout>{children}</AuthLayout>
}
