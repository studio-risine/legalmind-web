import { ResetPasswordForm } from '@/modules/auth'
import { AuthBox, AuthBoxContent, AuthBoxHeader } from '../components'

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
