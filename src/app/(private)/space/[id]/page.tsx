import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'

interface SpaceHomePageProps {
	params: Promise<{ id: string }>
}

export default async function SpaceHomePage({ params }: SpaceHomePageProps) {
	const { id: spaceId } = await params

	const breadcrumb = [{ label: 'Space', href: `/space/${spaceId}` }]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">
						Dashboard do Space
					</h1>
					<p className="text-muted-foreground">Space ID: {spaceId}</p>
				</div>
			</MainContent>
		</>
	)
}
