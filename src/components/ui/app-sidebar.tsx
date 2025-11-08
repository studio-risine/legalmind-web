'use client'

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarTrigger,
	useSidebar,
} from '@components/ui/sidebar'
import { useNavigation } from '@hooks/use-navigation'
import { cn } from '@libs/utils'
import { RiBeerFill, RiCake2Fill, RiCheckboxBlankCircleFill, RiCupFill } from '@remixicon/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MainNavigationSidebar from './app-nav-main'

export const teams = [
	{ id: '1', logo: RiCupFill, name: 'Alpha Inc.', plan: 'Free' },
	{ id: '2', logo: RiBeerFill, name: 'Beta Corp.', plan: 'Free' },
	{ id: '3', logo: RiCake2Fill, name: 'Gamma Tech', plan: 'Free' },
]

interface AppSidebarProps {
	spaceId: string
}

export function AppSidebar({ spaceId }: AppSidebarProps) {
	const { state } = useSidebar()
	const { mainNavigationRoutes } = useNavigation()

	const isCollapsed = state === 'collapsed'
	const routes = mainNavigationRoutes(spaceId)

	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader
				className={cn(
					'flex md:pt-1 md:pb-6',
					isCollapsed
						? 'flex-row items-center justify-between gap-y-2 md:flex-col md:items-start md:justify-start md:pt-3'
						: 'flex-row items-center justify-between px-1',
				)}
			>
				<div
					className={cn(
						'flex grow',
						isCollapsed ? 'flex-col items-center gap-4' : 'items-center justify-between',
					)}
				>
					<Link className="flex items-center" href={`/space/${spaceId}`}>
						<RiCheckboxBlankCircleFill size={24} />

						{!isCollapsed && (
							<div className="ml-2 text-white">
								<b className="font-bold text-white text-xl leading-10">Lemi</b>
							</div>
						)}
					</Link>

					<motion.div
						animate={{ opacity: 1 }}
						className={cn(
							'flex items-center gap-2',
							isCollapsed ? 'flex-row md:flex-col-reverse' : 'flex-row',
						)}
						initial={{ opacity: 0 }}
						key={isCollapsed ? 'header-collapsed' : 'header-expanded'}
						transition={{ duration: 0.1 }}
					>
						<SidebarTrigger />
					</motion.div>
				</div>
			</SidebarHeader>
			<SidebarContent className="px-0">
				<MainNavigationSidebar routes={routes} />
			</SidebarContent>
			{/* <SidebarFooter className="px-2">
				<TeamSwitcher teams={teams} />
			</SidebarFooter> */}
		</Sidebar>
	)
}
