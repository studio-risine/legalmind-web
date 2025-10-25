import SpaceLayout from '@modules/space/layouts/default'
import type { ReactNode } from 'react'

interface LayoutProps {
	children: ReactNode
	params: Promise<{ id: string }>
}

export default async function Layout({
	children,
	params,
}: LayoutProps) {
	const { id: spaceId } = await params

	return (
		<SpaceLayout spaceId={spaceId}>{children}</SpaceLayout>
	)
}
