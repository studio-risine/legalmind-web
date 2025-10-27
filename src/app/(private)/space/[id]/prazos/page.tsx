import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@modules/dashboard/components'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	const breadcrumb = [
		{ label: 'Meu Space', href: `/space/${id}` },
		{ label: 'Prazos', href: `/space/${id}` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Prazos</h1>

					<p className="text-muted-foreground">Prazos: {id}</p>
				</div>
			</MainContent>
		</>
	)
}
