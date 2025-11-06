import { MainContent } from '@components/ui/main-content'
import { HeaderBreadcrumb } from '@modules/space/components'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string; clientId: string }>
}) {
	const { id } = await params
	const { clientId } = await params

	const breadcrumb = [
		{ label: 'Meu Space', href: `/space/${id}` },
		{ label: 'Clientes', href: `/space/${id}/clientes` },
		{ label: 'Client id', href: `/space/${id}/clientes/${clientId}` },
	]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Clientes</h1>

					<p className="text-muted-foreground">Clientes: {clientId}</p>
				</div>
			</MainContent>
		</>
	)
}
