import { MainContent } from '@components/ui/main-content'
import OnboardingStepper from '@modules/onboarding/components/onboarding-stepper'

export default async function Page() {
	return (
		<MainContent size="lg">
			<div className="flex min-h-full w-full items-center justify-center">
				<OnboardingStepper />
			</div>
		</MainContent>
	)
}
