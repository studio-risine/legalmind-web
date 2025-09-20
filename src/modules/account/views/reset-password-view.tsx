import { ResetPasswordForm } from '@/modules/auth'
import { AuthBox, AuthBoxContent, AuthBoxHeader } from '../components'

export function ResetPasswordView() {
	return (
		<AuthBox>
			<AuthBoxHeader title="Recuperar senha" />

			<AuthBoxContent>
				<ResetPasswordForm />
			</AuthBoxContent>
		</AuthBox>
	)
}
