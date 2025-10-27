'use client'

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@components/ui/sidebar'
import { cn } from '@libs/utils'

import type { RemixiconComponentType } from '@remixicon/react'
import Link from 'next/link'

export type MainNavigationSidebarProps = {
	id: string
	title: string
	icon?: RemixiconComponentType
	link: string
}

export default function MainNavigationSidebar({
	routes,
}: {
	routes: MainNavigationSidebarProps[]
}) {
	const { state } = useSidebar()

	const isCollapsed = state === 'collapsed'

	return (
		<SidebarGroup className="px-0">
			<SidebarMenu>
				{routes.map((item) => {
					const Icon = item.icon as RemixiconComponentType

					return (
						<SidebarMenuItem
							key={item.id}
							className={cn(
								isCollapsed ? 'flex items-center justify-center' : ' ',
							)}
						>
							<Link href={item.link}>
								<SidebarMenuButton tooltip={item.title}>
									{Icon && (
										<Icon
											size={32}
											className={cn('size-5', isCollapsed ? '' : 'mr-3')}
										/>
									)}

									<span className="font-semibold text-base text-sidebar-accent-foreground">
										{item.title}
									</span>
								</SidebarMenuButton>
							</Link>
						</SidebarMenuItem>
					)
				})}
			</SidebarMenu>
		</SidebarGroup>
	)
}
