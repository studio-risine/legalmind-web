// import { Badge } from '@/components/ui/badge'

// type ClientStatusProps = {
// 	status: CustomerStatus | null
// }

// export const customerStatusMap: Record<CustomerStatus, string> = {
// 	LEAD: 'Lead',
// 	PROSPECT: 'Prospect',
// 	ACTIVE: 'Ativo',
// 	DORMANT: 'Inativo',
// 	CHURNED: 'Perdido',
// }

// export function CustomerStatusBadge({ status }: ClientStatusProps) {
// 	return (
// 		<Badge variant="outline" className="flex items-center gap-2">
// 			{status === 'ACTIVE' && (
// 				<span
// 					data-testid="badge"
// 					className="h-2 w-2 rounded-full bg-emerald-300"
// 				/>
// 			)}

// 			<span className="font-medium text-muted-foreground">
// 				{status ? customerStatusMap[status] : 'Sem status'}
// 			</span>
// 		</Badge>
// 	)
// }
