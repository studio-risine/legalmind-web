import { Badge } from '@components/ui/badge'
import type { ProcessStatus } from '@infra/db/schemas'

type ProcessStatusProps = {
	status: ProcessStatus | null
}

export const processStatusMap: Record<ProcessStatus, string> = {
	ACTIVE: 'Ativo',
	ARCHIVED: 'Arquivado',
	CLOSED: 'Encerrado',
	PENDING: 'Pendente',
	SUSPENDED: 'Suspenso',
}

export function ProcessStatusBadge({ status }: ProcessStatusProps) {
	return (
		<Badge className="flex items-center gap-2" variant="secondary">
			{status === 'ACTIVE' && (
				<span
					className="h-2 w-2 rounded-full bg-emerald-300"
					data-testid="badge"
				/>
			)}

			<span className="font-medium text-muted-foreground" data-testid="badge">
				{status ? processStatusMap[status] : 'Sem status'}
			</span>
		</Badge>
	)
}
