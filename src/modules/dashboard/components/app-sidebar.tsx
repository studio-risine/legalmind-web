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
import { RiCheckboxBlankCircleFill, RiHome9Fill } from '@remixicon/react'
import { motion } from 'framer-motion'
import {
	Activity,
	DollarSign,
	LinkIcon,
	Package2,
	Percent,
	PieChart,
	Settings,
	ShoppingBag,
	Sparkles,
	Store,
	TrendingUp,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import DashboardNavigation, { type Route } from './nav-main'
import { NotificationsPopover } from './nav-notifications'
import { TeamSwitcher } from './team-switcher'

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

const dashboardRoutes: Route[] = [
	{
		id: 'home',
		title: 'Home',
		icon: <RiHome9Fill className="size-4" />,
		link: '/dashboard',
	},
	{
		id: 'processes',
		title: 'Processes',
		icon: <Package2 className="size-4" />,
		link: '#',
		subs: [
			{
				title: 'All',
				link: '/dashboard/processes',
				icon: <Package2 className="size-4" />,
			},
			{
				title: 'By Client',
				link: '/dashboard/processes?client=true',
				icon: <LinkIcon className="size-4" />,
			},
			{
				title: 'By Status',
				link: '/dashboard/processes?status=true',
				icon: <Percent className="size-4" />,
			},
		],
	},
	{
		id: 'usage-billing',
		title: 'Usage Billing',
		icon: <PieChart className="size-4" />,
		link: '#',
		subs: [
			{
				title: 'Meters',
				link: '#',
				icon: <PieChart className="size-4" />,
			},
			{
				title: 'Events',
				link: '/dashboard/events',
				icon: <Activity className="size-4" />,
			},
		],
	},
	{
		id: 'benefits',
		title: 'Benefits',
		icon: <Sparkles className="size-4" />,
		link: '/dashboard/benefits',
	},
	{
		id: 'clients',
		title: 'Clients',
		icon: <Users className="size-4" />,
		link: '/dashboard/clients',
	},
	{
		id: 'sales',
		title: 'Sales',
		icon: <ShoppingBag className="size-4" />,
		link: '#',
		subs: [
			{
				title: 'Orders',
				link: '#',
				icon: <ShoppingBag className="size-4" />,
			},
			{
				title: 'Subscriptions',
				link: '#',
			},
		],
	},
	{
		id: 'storefront',
		title: 'Storefront',
		icon: <Store className="size-4" />,
		link: '#',
	},
	{
		id: 'analytics',
		title: 'Analytics',
		icon: <TrendingUp className="size-4" />,
		link: '#',
	},
	{
		id: 'finance',
		title: 'Finance',
		icon: <DollarSign className="size-4" />,
		link: '#',
		subs: [
			{ title: 'Incoming', link: '#' },
			{ title: 'Outgoing', link: '#' },
			{ title: 'Payout Account', link: '#' },
		],
	},
	{
		id: 'settings',
		title: 'Settings',
		icon: <Settings className="size-4" />,
		link: '#',
		subs: [
			{ title: 'General', link: '#' },
			{ title: 'Webhooks', link: '#' },
			{ title: 'Custom Fields', link: '#' },
		],
	},
]

import { RiBeerFill, RiCake2Fill, RiCupFill } from '@remixicon/react'

export const teams = [
	{ id: '1', name: 'Alpha Inc.', logo: RiCupFill, plan: 'Free' },
	{ id: '2', name: 'Beta Corp.', logo: RiBeerFill, plan: 'Free' },
	{ id: '3', name: 'Gamma Tech', logo: RiCake2Fill, plan: 'Free' },
]

export function DashboardSidebar() {
	const { state } = useSidebar()
	const isCollapsed = state === 'collapsed'

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
				<Link href="/dashboard" className="flex items-center gap-2">
					<RiCheckboxBlankCircleFill size={36} />

					{!isCollapsed && <b className="font-bold text-xl">Legal Mind</b>}
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
				<DashboardNavigation routes={dashboardRoutes} />
			</SidebarContent>
			<SidebarFooter className="px-2">
				<TeamSwitcher teams={teams} />
			</SidebarFooter>
		</Sidebar>
	)
}
