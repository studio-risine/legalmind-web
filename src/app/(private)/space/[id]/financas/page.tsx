import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'

interface FinancasPageProps {
	params: Promise<{ id: string }>
}

export default async function FinancasPage({ params }: FinancasPageProps) {
	const { id: spaceId } = await params

	const breadcrumb = [
		{ label: 'Space', href: `/space/${spaceId}` },
		{ label: 'Finanças', href: `/space/${spaceId}/financas` },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />
			<MainContent size="2xl">
				<div>
					<h1 className="font-bold text-2xl text-foreground">Finanças</h1>
					<p className="text-muted-foreground">
						Gerencie as finanças do space: {spaceId}
					</p>
				</div>
			</MainContent>
		</>
	)
}
