import type { NavigationRoute } from '@components/ui/nav-main'
import {
	RiArticleLine,
	RiChat3Line,
	RiFolderLine,
	RiHome9Line,
	RiPieChart2Line,
	RiSettings2Line,
	RiUser6Line,
	RiWallet2Line,
} from '@remixicon/react'

/**
 * Generate navigation routes for the main sidebar
 * @param spaceId
 * @returns Array of NavigationRoute objects
 */
export function getNavMainRoutes(spaceId: string): NavigationRoute[] {
	return [
		{
			id: 'home',
			title: 'Home',
			icon: RiHome9Line,
			link: `/space/${spaceId}`,
		},
		{
			id: 'processes',
			title: 'Processos',
			icon: RiFolderLine,
			link: `/space/${spaceId}/processos`,
		},
		{
			id: 'publications',
			title: 'Publicações',
			icon: RiArticleLine,
			link: `/space/${spaceId}/publicacoes`,
		},
		{
			id: 'customers-support',
			title: 'Atendimentos',
			icon: RiChat3Line,
			link: `/space/${spaceId}/atendimentos`,
		},
		{
			id: 'clients',
			title: 'Clientes',
			icon: RiUser6Line,
			link: `/space/${spaceId}/clientes`,
		},
		{
			id: 'analytics',
			title: 'Indicadores',
			icon: RiPieChart2Line,
			link: '#',
		},
		{
			id: 'finance',
			title: 'Finanças',
			icon: RiWallet2Line,
			link: `/space/${spaceId}/financas`,
		},
		{
			id: 'settings',
			title: 'Configurações',
			icon: RiSettings2Line,
			link: `/space/${spaceId}/configuracoes`,
		},
	]
}
