import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'

interface PublicacoesPageProps {
	params: Promise<{ id: string }>
}

export default async function PublicacoesPage({
	params,
}: PublicacoesPageProps) {
	const { id: spaceId } = await params

	const breadcrumb = [
		{ label: 'Space', href: `/space/${spaceId}` },
		{ label: 'Publications', href: `/space/${spaceId}/publications` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Publications</h1>
					<p className="text-muted-foreground">
						Manage your publications in space: {spaceId}
					</p>
				</div>
			</MainContent>
		</>
	)
}
