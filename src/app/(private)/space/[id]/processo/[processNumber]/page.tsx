import { Badge } from '@components/ui/badge'
import { Card, CardContent } from '@components/ui/card'
import { MainContent } from '@components/ui/main-content'
import { getClientByIdAction } from '@modules/client/actions'
import { PageHeaderWithBreadcrumb } from '@modules/dashboard/components'
import { DeadlineList } from '@modules/deadline/components'
import { ProcessStatusBadge, queryProcessById } from '@modules/process'
import { truncateString } from '@utils/strings'

export default async function Page({
	params,
}: {
	params: Promise<{ id: string; processNumber: string }>
}) {
	const { id, processNumber } = await params

	const { data: process } = await queryProcessById({
		id: processNumber,
	})

	if (!process) {
		return <div>Process not found</div>
	}

	if (!process.clientId) {
		return <div>Client not associated with process</div>
	}

	const { data: client } = await getClientByIdAction({
		id: process.clientId,
	})

	const breadcrumb = [
		{ href: `/space/${id}`, label: 'Meu Space' },
		{ href: `/space/${id}/processos`, label: 'Processos' },
		{ href: `/space/${id}/processo/${processNumber}`, label: truncateString(process.title, 60) },
	]

	return (
		<>
			<PageHeaderWithBreadcrumb breadcrumb={breadcrumb} />

			<MainContent size="default">
				<section className="space-y-10">
					<header className="">
						<h1 className="font-bold text-foreground text-xl lg:text-2xl">{process.title}</h1>
						{process.description ? (
							<p className="text-foreground">{process.description}</p>
						) : (
							<p className="text-muted-foreground">Adicione uma breve descrição</p>
						)}

						<div className="mt-8 space-y-6">
							<div className="flex gap-6">
								<b className="font-semibold text-base">Informações</b>

								<div className="flex items-start justify-start gap-4">
									{client && <div>{truncateString(client.name, 20)}</div>}

									<Badge variant="secondary">{process.court}</Badge>
									<Badge variant="secondary">{process.courtClass}</Badge>

									<ProcessStatusBadge status={process.status} />

									{/* <div>Criado em 22/10/2025</div>
									<div>Distribuído em 16/09/2021</div> */}
								</div>
							</div>
						</div>

						<div>
							<h2 className="mb-1 font-semibold text-xl">Documents</h2>
							<Card>
								<CardContent> Card </CardContent>
							</Card>
						</div>
					</header>

					<main className="space-y-10">
						<div>
							<h2 className="mb-1 font-semibold text-xl">Prazos</h2>
							<div className="space-y-2">
								<DeadlineList processId={process._id} spaceId={id} />
							</div>
						</div>
					</main>
				</section>
			</MainContent>
		</>
	)
}
