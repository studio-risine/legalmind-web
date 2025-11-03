import { MainContent } from '@components/ui/main-content'
import { getSpaceIdFromHeaders } from '@libs/http/space'
import { PageHeaderWithBreadcrumb } from '@modules/dashboard/components'

export default async function Page() {
	const spaceId = await getSpaceIdFromHeaders()

	const breadcrumb = [{ label: 'Meu Space', href: `/space/${spaceId}` }]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Meu Spaces</h1>
					<p className="text-muted-foreground">Meu Space: {spaceId}</p>
				</div>
			</MainContent>
		</>
	)
}
