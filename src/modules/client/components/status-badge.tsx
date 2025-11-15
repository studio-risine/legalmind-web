import { Badge } from '@components/ui/badge'
import type { ClientStatus } from '@infra/db/schemas'

type ClientStatusProps = {
	status: ClientStatus | null
}

export const clientStatusMap: Record<ClientStatus, string> = {
	ACTIVE: 'Ativo',
	ARCHIVED: 'Arquivado',
	INACTIVE: 'Inativo',
	LEAD: 'Lead',
	PROSPECT: 'Prospect',
}

export function ClientStatusBadge({ status }: ClientStatusProps) {
	return (
		<Badge className="flex items-center gap-2" variant="secondary">
			{status === 'ACTIVE' && (
				<span
					className="h-2 w-2 rounded-full bg-emerald-300"
					data-testid="badge"
				/>
			)}

			<span className="font-medium text-muted-foreground" data-testid="badge">
				{status ? clientStatusMap[status] : 'Sem status'}
			</span>
		</Badge>
	)
}
