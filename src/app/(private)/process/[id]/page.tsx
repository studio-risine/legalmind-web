import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs'
import { db } from '@infra/db'
import { processes } from '@infra/db/schemas/core'
import { ProcessResumoTab } from '@modules/process'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

interface ProcessDetailPageProps {
	params: {
		id: string
	}
}

async function getProcess(id: string) {
	const [process] = await db.select().from(processes).where(eq(processes._id, id)).limit(1)

	return process
}

export default async function ProcessDetailPage({ params }: ProcessDetailPageProps) {
	const process = await getProcess(params.id)

	if (!process) {
		notFound()
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<h1 className="mb-2 font-bold text-3xl">{process.title}</h1>
				<p className="text-muted-foreground">Process: {process.processNumber}</p>
			</div>

			<Tabs className="w-full" defaultValue="resumo">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="resumo">Resumo</TabsTrigger>
					<TabsTrigger value="atividades">Atividades</TabsTrigger>
					<TabsTrigger value="historico">Histórico</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-4" value="resumo">
					<ProcessResumoTab process={process} />
				</TabsContent>

				<TabsContent className="space-y-4" value="atividades">
					<div className="rounded-lg border p-6">
						<p className="text-muted-foreground">
							Activities tab - Deadlines and documents will be displayed here
						</p>
					</div>
				</TabsContent>

				<TabsContent className="space-y-4" value="historico">
					<div className="rounded-lg border p-6">
						<p className="text-muted-foreground">
							Timeline tab - Process events will be displayed here
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
