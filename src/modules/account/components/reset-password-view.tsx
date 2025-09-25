import { ResetPasswordForm } from '@modules/auth/forms'
import { AuthBox, AuthBoxContent, AuthBoxHeader } from '.'

export function ResetPasswordView() {
	return (
		<AuthBox>
			<AuthBoxHeader
				title="Esqueci minha senha"
				description="Digite seu email que enviamos um link de recuperação"
			/>

			<AuthBoxContent>
				<ResetPasswordForm />
			</AuthBoxContent>
		</AuthBox>
	)
}
