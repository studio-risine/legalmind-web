import { Badge } from '@components/ui/badge'
import type { Deadline } from '@infra/db/schemas'
import {
	RiAlarmWarningFill,
	RiCloseCircleFill,
	RiProgress5Line,
	RiProgress8Fill,
} from '@remixicon/react'

type DeadlineStatus = Deadline['status']

type DeadlineStatusProps = {
	status: DeadlineStatus
}

export const deadlineStatusMap: Record<DeadlineStatus, string> = {
	CANCELED: 'Cancelado',
	DONE: 'Concluido',
	IN_PROGRESS: 'Em andamento',
	OPEN: 'Em aberto',
	OVERDUE: 'Atrasado',
}

export function DeadlineStatusBadge({ status }: DeadlineStatusProps) {
	return (
		<Badge className="flex items-center gap-2" variant="secondary">
			{status === 'IN_PROGRESS' && <RiProgress5Line className="fill-amber-400" />}
			{status === 'DONE' && <RiProgress8Fill className="fill-indigo-400" />}
			{status === 'CANCELED' && <RiCloseCircleFill className="fill-red-300" />}
			{status === 'OVERDUE' && <RiAlarmWarningFill className="fill-red-500" />}

			<span data-testid="badge">{status ? deadlineStatusMap[status] : 'Sem status'}</span>
		</Badge>
	)
}
