import type { ReactNode } from 'react'
import AccountLayout from '@/modules/account/layout/account-layout'

export default function Layout({ children }: { children: ReactNode }) {
	return <AccountLayout>{children}</AccountLayout>
}
