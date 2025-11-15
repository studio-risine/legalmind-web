import { MainContent } from '@components/ui/main-content'
import { HeaderBreadcrumb } from '@modules/space/components'
import { getSpaceIdFromHeaders } from '@modules/space/http/get-space-id-headers'

export default async function Page() {
	const spaceId = await getSpaceIdFromHeaders()

	const breadcrumb = [{ href: `/space/${spaceId}`, label: 'Meu Space' }]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Meu Spaces</h1>
					<p className="text-muted-foreground">Meu Space: {spaceId}</p>
				</div>
			</MainContent>
		</>
	)
}
