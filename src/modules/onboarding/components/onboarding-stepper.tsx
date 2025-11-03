import { Stepper } from '@components/ui/stepper'
import { accountByIdAction } from '@modules/account/actions/queries/account-by-id.action'
import {
	AccountStepForm,
	type AccountStepFormProps,
} from '../forms/account-step-form'
import { SpaceStepForm } from '../forms/space-step-form'
import { CompleteOnboarding } from './complete-step'

export default async function OnboardingStepper({
	accountId,
}: {
	accountId: string
}) {
	const { account } = await accountByIdAction({ id: accountId })

	if (!account) {
		throw new Error('Account not found')
	}

	const registeredAccountDetails: Pick<AccountStepFormProps, 'initialValues'> =
		{
			initialValues: {
				displayName: account.displayName ?? '',
				phoneNumber: account.phoneNumber ?? '',
				oabNumber: account.oabNumber ?? '',
				oabState: account.oabState ?? '',
			},
		}

	const STEPS = [
		{
			id: 'account',
			title: 'Conta',
			description: '',
			content: (
				<AccountStepForm
					accountId={accountId}
					initialValues={registeredAccountDetails.initialValues}
				/>
			),
		},
		{
			id: 'space',
			title: 'Space',
			description: '',
			content: <SpaceStepForm accountId={accountId} />,
		},
		{
			id: 'complete',
			title: 'Completo',
			description: '',
			content: <CompleteOnboarding />,
		},
	]

	return <Stepper steps={STEPS} initialStep={0} />
}
