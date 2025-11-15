import { Badge } from '@components/ui/badge'
import type { Deadline } from '@infra/db/schemas'

type DeadlinePriority = Deadline['priority']

type DeadlinePriorityProps = {
	priority: DeadlinePriority | null
}

export const DeadlinePriorityMap: Record<NonNullable<DeadlinePriority>, string> = {
	HIGH: 'Alta',
	LOW: 'Baixa',
	MEDIUM: 'Média',
	URGENT: 'Urgente',
}

export function DeadlinePriorityBadge({ priority }: DeadlinePriorityProps) {
	return (
		<Badge className="flex items-center gap-2" variant="secondary">
			{priority === 'HIGH' && (
				<span className="h-2 w-2 rounded-full bg-amber-300" data-testid="badge" />
			)}

			{priority === 'MEDIUM' && (
				<span className="h-2 w-2 rounded-full bg-red-300" data-testid="badge" />
			)}

			{priority === 'LOW' && (
				<span className="h-2 w-2 rounded-full bg-emerald-300" data-testid="badge" />
			)}

			<span className="font-medium" data-testid="badge">
				{priority ? `${DeadlinePriorityMap[priority]} Prioridade` : 'Sem Prioridade'}
			</span>
		</Badge>
	)
}
