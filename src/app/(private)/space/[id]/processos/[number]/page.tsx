import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@modules/dashboard/components'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string; number: string }>
}) {
	const { id } = await params
	const { number } = await params

	const breadcrumb = [
		{ label: 'Meu Space', href: `/space/${id}` },
		{ label: 'Processos', href: `/space/${id}/processos` },
		{ label: 'Processo Number', href: `/space/${id}/processo/${number}` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">
						Processo Number
					</h1>

					<p className="text-muted-foreground">Processos: {id}</p>
				</div>
			</MainContent>
		</>
	)
}
