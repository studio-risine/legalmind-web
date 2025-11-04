'use client'

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

function generateMainNavigationRoutes(spaceId: string) {
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
		// {
		// 	id: 'analytics',
		// 	title: 'Indicadores',
		// 	icon: RiPieChart2Line,
		// 	link: '#',
		// },
		{
			id: 'clients',
			title: 'Clientes',
			icon: RiUser6Line,
			link: `/space/${spaceId}/clientes`,
		},
		{
			id: 'finance',
			title: 'Financeiro',
			icon: RiWallet2Line,
			link: `/space/${spaceId}/financeiro`,
		},
		{
			id: 'settings',
			title: 'Configurações',
			icon: RiSettings2Line,
			link: `/space/${spaceId}/configuracoes`,
		},
	]
}

export function useNavigation() {
	const mainNavigationRoutes = (spaceId: string) => {
		if (!spaceId) return []

		const routes = generateMainNavigationRoutes(spaceId)

		return routes
	}

	return {
		mainNavigationRoutes,
	}
}
