import { UpdatePasswordForm } from '@modules/auth/forms'
import { AuthBox, AuthBoxContent, AuthBoxHeader } from '.'

export function UpdatePasswordView() {
	return (
		<AuthBox>
			<AuthBoxHeader title="Atualize sua senha" />
			<AuthBoxContent>
				<UpdatePasswordForm />
			</AuthBoxContent>
		</AuthBox>
	)
}
