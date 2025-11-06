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
				phoneNumber: account?.phoneNumber ?? '',
				oabNumber: account?.oabNumber ?? '',
				oabState: account?.oabState ?? '',
			},
		}

	const STEPS = [
		{
			id: 'account',
			title: 'Conta',
			description: '',
			content: (
				<AccountStepForm
					accountId={account?.id}
					initialValues={registeredAccountDetails.initialValues}
				/>
			),
		},
		{
			id: 'space',
			title: 'Space',
			description: '',
			content: <SpaceStepForm accountId={account?.id} />,
		},
		{
			id: 'complete',
			title: 'Completo',
			description: '',
			content: <CompleteOnboarding />,
		},
	]

	return (
		<div className="flex w-full max-w-lg justify-center">
			<Stepper steps={STEPS} initialStep={0} />
		</div>
	)
}
