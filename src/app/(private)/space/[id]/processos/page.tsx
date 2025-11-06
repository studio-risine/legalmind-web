import { MainContent } from '@components/ui/main-content'
import { HeaderBreadcrumb } from '@modules/space/components'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	const breadcrumb = [
		{ label: 'Meu Space', href: `/space/${id}` },
		{ label: 'Processos', href: `/space/${id}/processos` },
	]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Processos</h1>

					<p className="text-muted-foreground">Processos: {id}</p>
				</div>
			</MainContent>
		</>
	)
}
