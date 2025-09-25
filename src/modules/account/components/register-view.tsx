import { Anchor } from '@components/ui/anchor'
import { SignUpForm } from '@modules/auth/forms'
import {
	AuthBox,
	AuthBoxContent,
	AuthBoxFooter,
	AuthBoxHeader,
} from '../components'

export function RegisterView() {
	return (
		<AuthBox>
			<AuthBoxHeader
				title="Crie sua nova conta"
				description="Escolha o método para criação de sua conta"
			/>

			<AuthBoxContent>
				<SignUpForm />
			</AuthBoxContent>

			<AuthBoxFooter>
				<div className="text-center text-sm">
					Já tem uma conta?{' '}
					<Anchor href="/account/login" prefetch>
						Faça login
					</Anchor>
				</div>
			</AuthBoxFooter>
		</AuthBox>
	)
}
