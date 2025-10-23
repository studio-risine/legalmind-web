import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'

interface ClientsPageProps {
	params: Promise<{ id: string }>
}

export default async function ClientsPage({ params }: ClientsPageProps) {
	const { id: spaceId } = await params

	const breadcrumb = [
		{ label: 'Space', href: `/space/${spaceId}` },
		{ label: 'Clientes', href: `/space/${spaceId}/clients` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Clientes</h1>
					<p className="text-muted-foreground">
						Gerencie seus clientes no space: {spaceId}
					</p>
				</div>
			</MainContent>
		</>
	)
}
