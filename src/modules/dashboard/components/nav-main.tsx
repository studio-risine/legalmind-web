'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useState } from 'react'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuItem as SidebarMenuSubItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/libs/utils'

export type Route = {
	id: string
	title: string
	icon?: ReactNode
	link: string
	subs?: {
		title: string
		link: string
		icon?: ReactNode
	}[]
}

export default function DashboardNavigation({ routes }: { routes: Route[] }) {
	const { state } = useSidebar()
	const isCollapsed = state === 'collapsed'
	const [openCollapsible, setOpenCollapsible] = useState<string | null>(null)

	return (
		<SidebarMenu>
			{routes.map((route) => {
				const isOpen = !isCollapsed && openCollapsible === route.id
				const hasSubRoutes = !!route.subs?.length

				return (
					<SidebarMenuItem key={route.id}>
						{hasSubRoutes ? (
							<Collapsible
								open={isOpen}
								onOpenChange={(open) =>
									setOpenCollapsible(open ? route.id : null)
								}
								className="w-full"
							>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton
										className={cn(
											'flex w-full items-center rounded-lg px-2 transition-colors',
											isOpen
												? 'bg-sidebar-muted text-foreground'
												: 'text-muted-foreground hover:bg-sidebar-muted hover:text-foreground',
											isCollapsed && 'justify-center',
										)}
									>
										{route.icon}
										{!isCollapsed && (
											<span className="ml-2 flex-1 font-medium text-sm">
												{route.title}
											</span>
										)}
										{!isCollapsed && hasSubRoutes && (
											<span className="ml-auto">
												{isOpen ? (
													<ChevronUp className="size-4" />
												) : (
													<ChevronDown className="size-4" />
												)}
											</span>
										)}
									</SidebarMenuButton>
								</CollapsibleTrigger>

								{!isCollapsed && (
									<CollapsibleContent>
										<SidebarMenuSub className="my-1 ml-3.5">
											{route.subs?.map((subRoute) => (
												<SidebarMenuSubItem
													key={`${route.id}-${subRoute.title}`}
													className="h-auto"
												>
													<SidebarMenuSubButton asChild>
														<Link
															href={subRoute.link}
															prefetch={true}
															className="flex items-center rounded-md px-4 py-1.5 font-medium text-muted-foreground text-sm hover:bg-sidebar-muted hover:text-foreground"
														>
															{subRoute.title}
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								)}
							</Collapsible>
						) : (
							<SidebarMenuButton tooltip={route.title} asChild>
								<Link
									href={route.link}
									prefetch={true}
									className={cn(
										'flex items-center rounded-lg px-2 text-muted-foreground transition-colors hover:bg-sidebar-muted hover:text-foreground',
										isCollapsed && 'justify-center',
									)}
								>
									{route.icon}
									{!isCollapsed && (
										<span className="ml-2 font-medium text-sm">
											{route.title}
										</span>
									)}
								</Link>
							</SidebarMenuButton>
						)}
					</SidebarMenuItem>
				)
			})}
		</SidebarMenu>
	)
}
