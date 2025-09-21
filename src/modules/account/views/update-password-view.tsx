import { UpdatePasswordForm } from '@/modules/auth'
import { AuthBox, AuthBoxContent, AuthBoxHeader } from '../components'

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
