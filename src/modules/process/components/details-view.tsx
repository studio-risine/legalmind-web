'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Separator } from '@components/ui/separator'
import type { Process } from '@infra/db/schemas/processes'
import { useClientQuery } from '@modules/client/hooks/use-client-queries'
import { ProcessStatusBadge } from './status-badge'

interface DetailsViewProps {
	process: Process
}

export function DetailsView({ process }: DetailsViewProps) {
	const { data: clientData } = useClientQuery(process.client_id || '', {
		enabled: !!process.client_id,
	})

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Informações do Processo</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h4 className="font-medium text-muted-foreground text-sm">
							Título
						</h4>
						<p className="font-medium text-sm">
							{process.title || 'Não informado'}
						</p>
					</div>

					<Separator />

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<h4 className="font-medium text-muted-foreground text-sm">CNJ</h4>
							<p className="font-mono text-sm">
								{process.cnj || 'Não informado'}
							</p>
						</div>

						<div>
							<h4 className="font-medium text-muted-foreground text-sm">
								Tribunal
							</h4>
							<p className="text-sm">{process.court || 'Não informado'}</p>
						</div>
					</div>

					<Separator />

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<h4 className="font-medium text-muted-foreground text-sm">
								Status
							</h4>
							<ProcessStatusBadge status={process.status} />
						</div>

						{process.client_id && (
							<div>
								<h4 className="font-medium text-muted-foreground text-sm">
									Cliente
								</h4>
								<p className="font-medium text-sm">
									{clientData?.name || 'Carregando...'}
								</p>
							</div>
						)}
					</div>

					<Separator />

					<div>
						<h4 className="font-medium text-muted-foreground text-sm">
							Criado em
						</h4>
						<p className="text-sm">
							{new Date(process.created_at).toLocaleDateString('pt-BR', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							})}
						</p>
					</div>

					{process.updated_at && (
						<>
							<Separator />
							<div>
								<h4 className="font-medium text-muted-foreground text-sm">
									Última atualização
								</h4>
								<p className="text-sm">
									{new Date(process.updated_at).toLocaleDateString('pt-BR', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									})}
								</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
