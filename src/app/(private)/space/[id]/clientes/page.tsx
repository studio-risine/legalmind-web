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
		{ label: 'Clientes', href: `/space/${id}/clientes` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Clientes</h1>

					<p className="text-muted-foreground">Clientes: {id}</p>
				</div>
			</MainContent>
		</>
	)
}
