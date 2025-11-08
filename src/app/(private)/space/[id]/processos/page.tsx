import { MainContent } from '@components/ui/main-content'
import { ProcessDisplay } from '@modules/process'
import { HeaderBreadcrumb } from '@modules/space/components'
import type { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'
import { loadSearchParams } from '../searchParams'

type PageProps = {
	params: Promise<{ id: string }>
	searchParams: Promise<SearchParams>
}

export default async function Page({ params, searchParams }: PageProps) {
	const { id: spaceId } = await params

	const { search, page, pageSize } = await loadSearchParams(searchParams)

	const breadcrumb = [
		{ label: 'Meu Space', href: `/space/${spaceId}` },
		{ label: 'Processos', href: `/space/${spaceId}/processos` },
	]

	return (
		<>
			<HeaderBreadcrumb items={breadcrumb} />

			<MainContent size="2xl">
				<div className="space-y-6">
					<div>
						<h1 className="font-bold text-2xl text-foreground">Processos</h1>
						<p className="text-muted-foreground">
							Gerencie seus processos judiciais
						</p>
					</div>

					<Suspense fallback={'loading'}>
						<ProcessDisplay
							spaceId={spaceId}
							search={search}
							page={page}
							pageSize={pageSize}
						/>
					</Suspense>
				</div>
			</MainContent>
		</>
	)
}
