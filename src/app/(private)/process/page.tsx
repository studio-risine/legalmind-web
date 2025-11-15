import { ProcessListTable } from '@modules/process'
import Link from 'next/link'

export default function ProcessPage() {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="mb-2 font-bold text-3xl">Legal Processes</h1>
					<p className="text-muted-foreground">Manage and track all legal processes</p>
				</div>
				<div className="flex gap-2">
					<Link
						className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
						href="/process/new"
					>
						New Process
					</Link>
					<Link
						className="rounded-md border border-input bg-background px-4 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
						href="/process/import"
					>
						Import
					</Link>
				</div>
			</div>
			<ProcessListTable />
		</div>
	)
}
