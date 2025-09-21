import { Anchor } from '@/components/ui/anchor'
import { SignInPasswordForm } from '@/modules/auth/sign-in-password/sign-in-password-form'
import {
	AuthBox,
	AuthBoxContent,
	AuthBoxFooter,
	AuthBoxHeader,
} from '../components'

export function LoginView() {
	return (
		<AuthBox>
			<AuthBoxHeader title="Entre na sua conta" />

			<AuthBoxContent>
				<SignInPasswordForm />
			</AuthBoxContent>

			<AuthBoxFooter>
				<div className="text-center text-sm">
					Não tem uma conta?{' '}
					<Anchor href="/account/register" prefetch>
						Cadastre-se
					</Anchor>
				</div>
			</AuthBoxFooter>
		</AuthBox>
	)
}
