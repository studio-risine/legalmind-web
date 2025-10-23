import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'

interface ConfiguracoesPageProps {
	params: Promise<{ id: string }>
}

export default async function ConfiguracoesPage({
	params,
}: ConfiguracoesPageProps) {
	const { id: spaceId } = await params

	const breadcrumb = [
		{ label: 'Space', href: `/space/${spaceId}` },
		{ label: 'Settings', href: `/space/${spaceId}/configuracoes` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Configurações</h1>
					<p className="text-muted-foreground">
						Manage the settings of space: {spaceId}
					</p>
				</div>
			</MainContent>
		</>
	)
}
