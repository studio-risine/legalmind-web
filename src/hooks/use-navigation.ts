'use client'

import {
	RiArticleLine,
	RiChat3Line,
	RiFolderLine,
	RiHome9Line,
	RiSettings2Line,
	RiUser6Line,
	RiWallet2Line,
} from '@remixicon/react'

function generateMainNavigationRoutes(spaceId: string) {
	return [
		{
			icon: RiHome9Line,
			id: 'home',
			link: `/space/${spaceId}`,
			title: 'Home',
		},
		{
			icon: RiFolderLine,
			id: 'processes',
			link: `/space/${spaceId}/processos`,
			title: 'Processos',
		},
		{
			icon: RiArticleLine,
			id: 'publications',
			link: `/space/${spaceId}/publicacoes`,
			title: 'Publicações',
		},
		{
			icon: RiChat3Line,
			id: 'customers-support',
			link: `/space/${spaceId}/atendimentos`,
			title: 'Atendimentos',
		},
		{
			icon: RiUser6Line,
			id: 'clients',
			link: `/space/${spaceId}/clientes`,
			title: 'Clientes',
		},
		{
			icon: RiWallet2Line,
			id: 'finance',
			link: `/space/${spaceId}/financeiro`,
			title: 'Financeiro',
		},
		{
			icon: RiSettings2Line,
			id: 'settings',
			link: `/space/${spaceId}/configuracoes`,
			title: 'Configurações',
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
