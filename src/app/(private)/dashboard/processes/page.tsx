import { RiLayoutGrid2Fill, RiListOrdered } from '@remixicon/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PageContent } from '@/components/ui/page-content'
import { PageHeader, PageHeaderTitle } from '@/components/ui/page-header'
export default function ProcessesPage() {
	return (
		<PageContent>
			<PageHeader>
				<PageHeaderTitle>Processes</PageHeaderTitle>

				<div className="flex items-center justify-end gap-4">
					<div>
						<Button size="icon" variant="ghost">
							<RiLayoutGrid2Fill />
						</Button>
						<Button size="icon" variant="ghost">
							<RiListOrdered />
						</Button>
					</div>
					<Button size="sm" asChild>
						<Link href="./processes/create">Create</Link>
					</Button>
				</div>
			</PageHeader>

			<div>List</div>
		</PageContent>
	)
}
