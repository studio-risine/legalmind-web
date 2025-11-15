import { ResetPasswordForm } from '@modules/auth/forms'
import { AuthBox, AuthBoxContent, AuthBoxHeader } from '.'

export function ResetPasswordView() {
	return (
		<AuthBox>
			<AuthBoxHeader
				description="Digite seu email que enviamos um link de recuperação"
				title="Esqueci minha senha"
			/>

			<AuthBoxContent>
				<ResetPasswordForm />
			</AuthBoxContent>
		</AuthBox>
	)
}
