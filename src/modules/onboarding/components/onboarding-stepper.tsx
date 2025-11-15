'use server'

import { Stepper } from '@components/ui/stepper'
import { accountByUserIdAction } from '@modules/account'
import {
	AccountStepForm,
	type AccountStepFormProps,
} from '../forms/account-step-form'
import { SpaceStepForm } from '../forms/space-step-form'
import { CompleteOnboarding } from './complete-step'

export default async function OnboardingStepper() {
	const { data: account } = await accountByUserIdAction()

	const registeredAccountDetails: Pick<AccountStepFormProps, 'initialValues'> =
		{
			initialValues: {
				displayName: account?.displayName ?? '',
				oabNumber: account?.oabNumber ?? '',
				oabState: account?.oabState ?? '',
				phoneNumber: account?.phoneNumber ?? '',
			},
		}

	const STEPS = [
		{
			content: (
				<AccountStepForm
					accountId={account?.id}
					initialValues={registeredAccountDetails.initialValues}
				/>
			),
			description: '',
			id: 'account',
			title: 'Conta',
		},
		{
			content: <SpaceStepForm accountId={account?.id} />,
			description: '',
			id: 'space',
			title: 'Space',
		},
		{
			content: <CompleteOnboarding />,
			description: '',
			id: 'complete',
			title: 'Completo',
		},
	]

	return (
		<div className="flex w-full max-w-lg justify-center">
			<Stepper initialStep={0} steps={STEPS} />
		</div>
	)
}
