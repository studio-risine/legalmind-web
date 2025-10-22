import { MainContent } from '@components/ui/main-content'
import { PageHeaderWithBreadcrumb } from '@components/ui/page-header-breadcrumb'
import { Stats } from '@modules/space/components/stats-view'

const breadcrumb = [{ label: 'Space', href: '/Space' }]

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="2xl">
				<div>
					<h1 className='font-bold text-2xl text-foreground'>Processos </h1>
					<span>{id}</span>
				</div>
				<Stats />
			</MainContent>
		</>
	)
}
