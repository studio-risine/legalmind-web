import SpaceLayout from '@modules/space/layouts/default'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return <SpaceLayout>{children}</SpaceLayout>
}
