import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'

interface AtendimentosPageProps {
	params: Promise<{ id: string }>
}

export default async function AtendimentosPage({
	params,
}: AtendimentosPageProps) {
	const { id: spaceId } = await params

	const breadcrumb = [
		{ label: 'Space', href: `/space/${spaceId}` },
		{ label: 'Atendimentos', href: `/space/${spaceId}/antendimentos` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Atendimentos</h1>
					<p className="text-muted-foreground">
						Manage your customer support in space: {spaceId}
					</p>
				</div>
			</MainContent>
		</>
	)
}
