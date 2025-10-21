import { Badge } from '@components/ui/badge'
import { PROCESS_STATUS } from '@constants/process'

type ProcessStatusProps = {
	status: string | null
}

export const processStatusMap: Record<string, string> = Object.fromEntries(
	PROCESS_STATUS.map((s) => [s.value, s.label]),
)

export function ProcessStatusBadge({ status }: ProcessStatusProps) {
	const getStatusColor = (status: string | null) => {
		switch (status) {
			case 'active':
				return 'bg-emerald-100 text-emerald-800 border-emerald-200'
			case 'suspended':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			case 'dismissed':
			case 'closed':
				return 'bg-gray-100 text-gray-800 border-gray-200'
			case 'archived':
				return 'bg-slate-100 text-slate-800 border-slate-200'
			default:
				return 'bg-blue-100 text-blue-800 border-blue-200'
		}
	}

	const getStatusDot = (status: string | null) => {
		switch (status) {
			case 'active':
				return <span className="h-2 w-2 rounded-full bg-emerald-500" />
			case 'suspended':
				return <span className="h-2 w-2 rounded-full bg-yellow-500" />
			case 'dismissed':
			case 'closed':
				return <span className="h-2 w-2 rounded-full bg-gray-500" />
			case 'archived':
				return <span className="h-2 w-2 rounded-full bg-slate-500" />
			default:
				return <span className="h-2 w-2 rounded-full bg-blue-500" />
		}
	}

	return (
		<Badge
			variant="outline"
			className={`flex items-center gap-2 ${getStatusColor(status)}`}
		>
			{getStatusDot(status)}
			<span className="font-medium">
				{status ? processStatusMap[status] : 'Sem status'}
			</span>
		</Badge>
	)
}
