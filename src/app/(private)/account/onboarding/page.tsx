import { MainContent } from '@components/ui/main-content'
import OnboardingStepper from '@modules/onboarding/components/onboarding-stepper'
import { notFound } from 'next/navigation'
import type { SearchParams } from 'nuqs/server'
import { loadSearchParams } from './searchParams'

type PageProps = {
	searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: PageProps) {
	const { accountId } = await loadSearchParams(searchParams)

	if (!accountId) {
		notFound()
	}

	return (
		<MainContent size="lg">
			<div className="flex min-h-full w-full items-center justify-center">
				<OnboardingStepper accountId={accountId} />
			</div>
		</MainContent>
	)
}
