import { MainContent } from '@components/ui/main-content'
import { createClient } from '@libs/supabase/server'
import { getAccountByIdAction } from '@modules/account/actions/get-account-by-id-action'
import OnboardingStepper from '@modules/onboarding/components/onboarding-stepper'
import { redirect } from 'next/navigation'

export default async function Page() {
	const supabase = await createClient()
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()

	if (error || !user) {
		redirect('/account/login')
	}

	let initialAccountData = {}
	try {
		const accountResult = await getAccountByIdAction({ accountId: user.id })

		if (accountResult.success && accountResult.data) {
			initialAccountData = {
				displayName: accountResult.data.displayName,
				email: accountResult.data.email,
				phoneNumber: accountResult.data.phoneNumber,
				oabNumber: accountResult.data.oabNumber,
				oabState: accountResult.data.oabState,
			}
		}
	} catch (error) {
		console.log('Account not found, continuing with empty data')
	}

	return (
		<div className='flex h-full items-center justify-center'>
			<div className="w-full max-w-2xl">
				<OnboardingStepper
					userId={user.id}
					initialAccountData={initialAccountData}
				/>
			</div>
		</div>
	)
}
