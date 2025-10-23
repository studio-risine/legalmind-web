import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'

interface ProcessosPageProps {
	params: Promise<{ id: string }>
}

export default async function ProcessosPage({ params }: ProcessosPageProps) {
	const { id: spaceId } = await params

	const breadcrumb = [
		{ label: 'Space', href: `/space/${spaceId}` },
		{ label: 'Processes', href: `/space/${spaceId}/processes` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Processes</h1>
					<p className="text-muted-foreground">
						Manage your processes in space: {spaceId}
					</p>
				</div>
			</MainContent>
		</>
	)
}
