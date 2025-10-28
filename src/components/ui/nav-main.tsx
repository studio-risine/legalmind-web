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
import { RiCheckboxBlankCircleFill } from '@remixicon/react'
import { motion } from 'framer-motion'

import Link from 'next/link'
import { NotificationsPopover } from '../../modules/space/components/nav-notifications'
import { TeamSwitcher } from '../../modules/space/components/team-switcher'

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

import NavMain from '@components/ui/nav-main'
import { getNavMainRoutes } from '@config/routes'
import { RiBeerFill, RiCake2Fill, RiCupFill } from '@remixicon/react'

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
	const isCollapsed = state === 'collapsed'
	const routes = getNavMainRoutes(spaceId)

	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader
				className={cn(
					'flex md:pt-3.5',
					isCollapsed
						? 'flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start'
						: 'flex-row items-center justify-between',
				)}
			>
				<Link href="/dashboard" className="flex items-center sm:mx-auto">
					<RiCheckboxBlankCircleFill size={24} />

					{!isCollapsed && (
						<div className="ml-2">
							<b className="font-bold text-base">Legal Mind</b>
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
					transition={{ duration: 0.8 }}
				>
					<NotificationsPopover notifications={sampleNotifications} />
					<SidebarTrigger />
				</motion.div>
			</SidebarHeader>
			<SidebarContent className="gap-4 px-2 py-4">
				<NavMain routes={routes} />
			</SidebarContent>
			<SidebarFooter className="px-2">
				<TeamSwitcher teams={teams} />
			</SidebarFooter>
		</Sidebar>
	)
}
