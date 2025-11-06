import { Badge } from '@components/ui/badge'
import type { ClientStatus } from '@infra/db/schemas'

type ClientStatusProps = {
	status: ClientStatus | null
}

export const clientStatusMap: Record<ClientStatus, string> = {
	LEAD: 'Lead',
	PROSPECT: 'Prospect',
	ACTIVE: 'Ativo',
	ARCHIVED: 'Arquivado',
	INACTIVE: 'Inativo',
}

export function ClientStatusBadge({ status }: ClientStatusProps) {
	return (
		<Badge variant="secondary" className="flex items-center gap-2">
			{status === 'ACTIVE' && (
				<span
					data-testid="badge"
					className="h-2 w-2 rounded-full bg-emerald-300"
				/>
			)}

			<span className="font-medium text-muted-foreground" data-testid="badge">
				{status ? clientStatusMap[status] : 'Sem status'}
			</span>
		</Badge>
	)
}
