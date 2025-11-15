import { MainContent } from '@components/ui/main-content'
import { HeaderBreadcrumb } from '@modules/space/components'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	const breadcrumb = [
		{ href: `/space/${id}`, label: 'Meu Space' },
		{
			href: `/space/${id}/Financeiro`,
			label: 'Financeiro',
		},
	]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Financeiro</h1>

					<p className="text-muted-foreground">Financeiro: {id}</p>
				</div>
			</MainContent>
		</>
	)
}
