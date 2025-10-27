'use client'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarTrigger,
	useSidebar,
} from '@components/ui/sidebar'
import { cn } from '@libs/utils'

import { motion } from 'framer-motion'

import Link from 'next/link'

// import { NotificationsPopover } from '../../modules/space/components/nav-notifications'
// import { TeamSwitcher } from '../../modules/space/components/team-switcher'

const sampleNotifications = [
	{
		id: '1',
		avatar: '/avatars/01.png',
		fallback: 'OM',
		text: 'New order received.',
		time: '10m ago',
	},
	{
		id: '2',
		avatar: '/avatars/02.png',
		fallback: 'JL',
		text: 'Server upgrade completed.',
		time: '1h ago',
	},
	{
		id: '3',
		avatar: '/avatars/03.png',
		fallback: 'HH',
		text: 'New user signed up.',
		time: '2h ago',
	},
]

import { useNavigation } from '@hooks/use-navigation'
import { NotificationsPopover } from '@modules/dashboard/components/nav-notifications'
import { TeamSwitcher } from '@modules/dashboard/components/team-switcher'
import {
	RiBeerFill,
	RiCake2Fill,
	RiCheckboxBlankCircleFill,
	RiCupFill,
} from '@remixicon/react'
import MainNavigationSidebar from './app-nav-main'

export const teams = [
	{ id: '1', name: 'Alpha Inc.', logo: RiCupFill, plan: 'Free' },
	{ id: '2', name: 'Beta Corp.', logo: RiBeerFill, plan: 'Free' },
	{ id: '3', name: 'Gamma Tech', logo: RiCake2Fill, plan: 'Free' },
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
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader
				className={cn(
					'flex md:pt-3.5',
					isCollapsed
						? 'flex-row items-center justify-between gap-y-2 md:flex-col md:items-start md:justify-start'
						: 'flex-row items-center justify-between px-1',
				)}
			>
				<div
					className={cn(
						'flex grow',
						isCollapsed
							? 'flex-col items-center gap-4'
							: 'items-center justify-between',
					)}
				>
					<Link href={`/space/${spaceId}`} className="flex items-center">
						<RiCheckboxBlankCircleFill size={24} />

						{!isCollapsed && (
							<div className="ml-2 text-white">
								<b className="font-bold text-white text-xl leading-10">Lemi</b>
							</div>
						)}
					</Link>

					<motion.div
						key={isCollapsed ? 'header-collapsed' : 'header-expanded'}
						className={cn(
							'flex items-center gap-2',
							isCollapsed ? 'flex-row md:flex-col-reverse' : 'flex-row',
						)}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.1 }}
					>
						<NotificationsPopover notifications={sampleNotifications} />
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
