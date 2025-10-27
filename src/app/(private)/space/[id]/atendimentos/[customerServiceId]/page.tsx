import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@modules/dashboard/components'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string; customerServiceId: string }>
}) {
	const { id } = await params
	const { customerServiceId } = await params

	const breadcrumb = [
		{ label: 'Meu Space', href: `/space/${id}` },
		{ label: 'Atendimentos', href: `/space/${id}/atendimentos` },
		{
			label: 'Nome do Cliente',
			href: `/space/${id}/atendimentos/${customerServiceId}`,
		},
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Atendimento</h1>

					<p className="text-muted-foreground">
						Atendimento: {customerServiceId}
					</p>
				</div>
			</MainContent>
		</>
	)
}
