import type { Process } from '@infra/db/schemas/core'
import { formatProcessNumber } from '@utils/formatters/process-number'

interface ProcessResumoTabProps {
	process: Process
}

/**
 * Resumo (Summary) tab for process detail page
 * Displays process metadata, parties, court information, and phase
 */
export function ProcessResumoTab({ process }: ProcessResumoTabProps) {
	return (
		<div className="space-y-6">
			{/* Process Information Card */}
			<div className="rounded-lg border bg-card p-6">
				<h2 className="mb-4 font-semibold text-xl">Process Information</h2>
				<dl className="grid gap-4 sm:grid-cols-2">
					<div>
						<dt className="font-medium text-muted-foreground text-sm">Process Number (CNJ)</dt>
						<dd className="mt-1 text-sm">{formatProcessNumber(process.processNumber)}</dd>
					</div>
					<div>
						<dt className="font-medium text-muted-foreground text-sm">Status</dt>
						<dd className="mt-1 text-sm">
							<span
								className={`inline-flex rounded-full px-2 py-1 font-semibold text-xs ${
									process.status === 'ACTIVE'
										? 'bg-green-100 text-green-800'
										: process.status === 'ARCHIVED'
											? 'bg-gray-100 text-gray-800'
											: 'bg-blue-100 text-blue-800'
								}`}
							>
								{process.status}
							</span>
						</dd>
					</div>
					{process.courtClass && (
						<div>
							<dt className="font-medium text-muted-foreground text-sm">Class</dt>
							<dd className="mt-1 text-sm">{process.courtClass}</dd>
						</div>
					)}
					{process.court && (
						<div>
							<dt className="font-medium text-muted-foreground text-sm">Court/Vara</dt>
							<dd className="mt-1 text-sm">{process.court}</dd>
						</div>
					)}
					{process.phase && (
						<div>
							<dt className="font-medium text-muted-foreground text-sm">Current Phase</dt>
							<dd className="mt-1 text-sm">{process.phase}</dd>
						</div>
					)}
					<div>
						<dt className="font-medium text-muted-foreground text-sm">Created At</dt>
						<dd className="mt-1 text-sm">
							{new Date(process.createdAt).toLocaleDateString('en-US', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</dd>
					</div>
				</dl>
			</div>

			{/* Parties Summary Card */}
			{process.partiesSummary && (
				<div className="rounded-lg border bg-card p-6">
					<h2 className="mb-4 font-semibold text-xl">Parties Involved</h2>
					<p className="text-sm">{process.partiesSummary}</p>
				</div>
			)}

			{/* Description Card */}
			{process.description && (
				<div className="rounded-lg border bg-card p-6">
					<h2 className="mb-4 font-semibold text-xl">Description</h2>
					<p className="text-sm">{process.description}</p>
				</div>
			)}

			{/* Quick Actions */}
			<div className="flex gap-2">
				<button
					className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
					type="button"
				>
					Edit Process
				</button>
				<button
					className="rounded-md border border-input bg-background px-4 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
					type="button"
				>
					Export PDF
				</button>
				<button
					className="rounded-md border border-input bg-background px-4 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
					type="button"
				>
					Archive
				</button>
			</div>
		</div>
	)
}
