'use client'

import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@components/ui/sidebar'

import type { RemixiconComponentType } from '@remixicon/react'
import Link from 'next/link'

export interface NavigationRoute {
	id: string
	title: string
	icon?: RemixiconComponentType
	link: string
}

export default function NavMain({ routes }: { routes: NavigationRoute[] }) {
	return (
		<SidebarGroup>
			<SidebarMenu>
				{routes.map((item) => {
					const Icon = item.icon as RemixiconComponentType

					return (
						<SidebarMenuItem key={item.id}>
							<Link href={item.link}>
								<SidebarMenuButton className="gap-4" tooltip={item.title}>
									{Icon && <Icon className="size-4" />}
									<span className="text-base">{item.title}</span>
								</SidebarMenuButton>
							</Link>
						</SidebarMenuItem>
					)
				})}
			</SidebarMenu>
		</SidebarGroup>
	)
}
