import { Badge } from '@components/ui/badge'
import { Card } from '@components/ui/card'
import type { Deadline } from '@infra/db/schemas'
import { dayjs } from '@libs/days'
import { cn } from '@libs/utils'
import { listDeadlinesAction } from '@modules/deadline/actions'
import { getSpaceIdFromHeaders } from '@modules/space/http/get-space-id-headers'
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react'
import { DeadlineStatusBadge } from './status-badge'

type DeadlineStatus = Deadline['status']
type DeadlinePriority = Deadline['priority']

const STATUS_CONFIG: Record<DeadlineStatus, { label: string; className: string }> = {
	CANCELED: {
		className: 'border-muted-foreground/20 bg-muted/60 text-muted-foreground',
		label: 'Cancelado',
	},
	DONE: { className: 'border-emerald-200 bg-emerald-100 text-emerald-700', label: 'Concluido' },
	OPEN: { className: 'border-amber-200 bg-amber-100 text-amber-700', label: 'Em aberto' },
}

const PRIORITY_CONFIG: Record<DeadlinePriority, { label: string; className: string }> = {
	HIGH: { className: 'border-rose-200 bg-rose-100 text-rose-700', label: 'Prioridade alta' },
	LOW: { className: 'border-sky-200 bg-sky-100 text-sky-700', label: 'Prioridade baixa' },
	MEDIUM: { className: 'border-blue-200 bg-blue-100 text-blue-700', label: 'Prioridade media' },
}

const BADGE_BASE_CLASS =
	'border-transparent px-2 py-1 text-[11px] font-semibold uppercase tracking-wide leading-none'

interface DeadlineListProps {
	processId?: string
	spaceId?: string
	limit?: number
}

export async function DeadlineList({ processId, spaceId, limit = 10 }: DeadlineListProps) {
	const resolvedSpaceId = spaceId ?? (await getSpaceIdFromHeaders())

	if (!resolvedSpaceId) {
		return (
			<Card className="items-center gap-2 px-6 py-10 text-center text-muted-foreground">
				<p className="font-medium text-foreground text-sm">Space nao encontrado</p>
				<span className="text-muted-foreground/80 text-xs">
					Configure o space para visualizar os prazos deste processo.
				</span>
			</Card>
		)
	}

	const { data, success, message } = await listDeadlinesAction({
		limit,
		processId,
		spaceId: resolvedSpaceId,
	})

	if (!success || !data) {
		return (
			<Card className="items-center gap-2 px-6 py-10 text-center text-muted-foreground">
				<p className="font-medium text-destructive text-sm">Falha ao carregar os prazos</p>
				{message ? <span className="text-muted-foreground/80 text-xs">{message}</span> : null}
			</Card>
		)
	}

	if (data.deadlines.length === 0) {
		return (
			<Card className="items-center gap-3 px-6 py-10 text-center text-muted-foreground">
				<p className="font-medium text-foreground text-sm">Nenhum prazo registrado</p>
				<span className="text-muted-foreground/80 text-xs">
					Cadastre um novo prazo para acompanhar os vencimentos.
				</span>
			</Card>
		)
	}

	const today = dayjs().startOf('day')

	return (
		<div className="space-y-3">
			{data.deadlines.map((deadline) => {
				const dueDate = dayjs(deadline.dueDate).startOf('day')

				const diffDays = dueDate.diff(today, 'day')
				const isCompleted = deadline.status === 'DONE'
				const isCanceled = deadline.status === 'CANCELED'

				// Determine how close the deadline is to inform styling and copy.
				const isOverdue = deadline.status === 'OPEN' && diffDays < 0
				const anticipationWindow = Math.max(deadline.anticipationDays ?? 0, 3)

				const isDueSoon =
					deadline.status === 'OPEN' && diffDays >= 0 && diffDays <= anticipationWindow

				let relativeMessage: string
				if (isCompleted) {
					relativeMessage = 'Prazo concluido'
				} else if (isCanceled) {
					relativeMessage = 'Prazo cancelado'
				} else if (isOverdue) {
					const daysLate = Math.abs(diffDays)
					relativeMessage = `Atrasado ha ${daysLate} dia${daysLate === 1 ? '' : 's'}`
				} else if (diffDays === 0) {
					relativeMessage = 'Vence hoje'
				} else if (diffDays === 1) {
					relativeMessage = 'Vence amanha'
				} else {
					relativeMessage = `Vence em ${diffDays} dias`
				}

				const highlightClass = isOverdue
					? 'border-destructive/70 bg-destructive/10'
					: isDueSoon
						? 'border-amber-400/70 bg-amber-50/60 dark:bg-amber-500/15'
						: isCompleted
							? 'border-emerald-400/40 bg-emerald-50/40 dark:bg-emerald-500/10'
							: 'border-border/60 bg-background/80'

				const messageTone = isOverdue
					? 'text-destructive'
					: isDueSoon
						? 'text-amber-600 dark:text-amber-300'
						: isCompleted
							? 'text-emerald-600 dark:text-emerald-300'
							: 'text-muted-foreground'

				const accentIndicator = isOverdue || isDueSoon

				return (
					<Card
						className={cn(
							'relative',
							'gap-4',
							'pl-7',
							'pr-6',
							'py-5',
							'transition-colors',
							'duration-200',
							'hover:border-foreground/30',
							highlightClass,
						)}
						key={deadline._id}
					>
						{accentIndicator ? (
							<span
								aria-hidden="true"
								className={cn(
									'absolute inset-y-4 left-0 w-1 rounded-full',
									isOverdue ? 'bg-destructive' : 'bg-amber-400',
								)}
							/>
						) : null}

						<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
							<div className="space-y-2">
								<div className="flex flex-wrap items-center gap-2">
									<Badge
										className={cn(BADGE_BASE_CLASS, PRIORITY_CONFIG[deadline.priority].className)}
										variant="outline"
									>
										{PRIORITY_CONFIG[deadline.priority].label}
									</Badge>
									<Badge
										className={cn(BADGE_BASE_CLASS, STATUS_CONFIG[deadline.status].className)}
										variant="outline"
									>
										{STATUS_CONFIG[deadline.status].label}
									</Badge>
									{isOverdue ? (
										<Badge
											className={cn(
												BADGE_BASE_CLASS,
												'border-destructive bg-destructive text-destructive-foreground',
											)}
											variant="outline"
										>
											<AlertTriangle className="size-3.5" />
											Atrasado
										</Badge>
									) : isDueSoon ? (
										<Badge
											className={cn(
												BADGE_BASE_CLASS,
												'border-amber-400 bg-amber-100 text-amber-700 dark:bg-amber-500/25 dark:text-amber-100',
											)}
											variant="outline"
										>
											<AlertTriangle className="size-3.5" />
											Atencao
										</Badge>
									) : null}
								</div>

								<h3 className="font-semibold text-base text-foreground">{deadline.description}</h3>

								{deadline.notes ? (
									<p
										className={cn(
											'max-w-prose',
											'leading-relaxed',
											'line-clamp-2',
											'text-muted-foreground',
											'text-sm',
										)}
									>
										{deadline.notes}
									</p>
								) : (
									<p className="text-muted-foreground/80 text-sm">Sem observacoes adicionadas.</p>
								)}

								<div className="flex flex-wrap gap-4 text-muted-foreground text-xs">
									<span>
										Antecedencia de {deadline.anticipationDays} dia
										{deadline.anticipationDays === 1 ? '' : 's'}
									</span>
									<span>Criado em {dayjs(deadline.createdAt).format('DD MMM YYYY')}</span>
								</div>
							</div>

							<div className="flex flex-col items-start gap-2 text-sm md:items-end">
								<div className="flex items-center gap-2 font-medium text-foreground">
									<CalendarClock className="size-4 text-muted-foreground" />
									{dayjs(deadline.dueDate).format('DD MMM YYYY')}
								</div>
								<div
									className={cn(
										'flex',
										'items-center',
										'gap-2',
										'font-semibold',
										'text-xs',
										'tracking-wide',
										'uppercase',
										messageTone,
									)}
								>
									{(isOverdue || isDueSoon) && <AlertTriangle className="size-3.5" />}
									{isCompleted && <CheckCircle2 className="size-3.5" />}
									{relativeMessage}
								</div>
								{deadline.completedAt ? (
									<div className="text-muted-foreground text-xs">
										Concluido em {dayjs(deadline.completedAt).format('DD MMM YYYY')}
									</div>
								) : null}
							</div>
						</div>
					</Card>
				)
			})}
		</div>
	)
}
