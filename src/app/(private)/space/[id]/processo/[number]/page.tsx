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
		{ href: `/space/${id}`, label: 'Meu Space' },
		{ href: `/space/${id}/processos`, label: 'Processos' },
		{
			href: `/space/${id}/processo/${number}`,
			label: 'Processo Number',
		},
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="default">
				<section>
					<header className="">
						<h1 className="font-bold text-2xl text-foreground">
							Minimal Product
						</h1>
						<p className="text-muted-foreground">Add a short summary</p>
					</header>

					<div className="mt-8 space-y-6">
						<div>Informaçoes</div>
					</div>

					<div className="mt-8">
						<div>Prazos</div>
					</div>
				</section>
			</MainContent>
		</>
	)
}
