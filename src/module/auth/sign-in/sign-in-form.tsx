'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Anchor } from '@/components/ui/anchor'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AuthBox, AuthBoxFooter, AuthBoxHeader } from '../components/auth-box'
import { AuthSeparator } from '../components/auth-separator'
import { ProviderGoogleIcon } from '../components/provide-google-icon'
import { signIn } from './sign-in-action'
import { useSignIn } from './use-sign-in'

const _schema = z.object({
	email: z.email({
		message: 'Por favor, insira um endereço de e-mail válido.',
	}),
	password: z.string().min(6, {
		message: 'A senha deve ter pelo menos 6 caracteres.',
	}),
})

export type SignInFormData = z.infer<typeof _schema>

export function SignInForm() {
	const { push } = useRouter()
	const form = useForm<SignInFormData>({
		resolver: zodResolver(_schema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const { execute, isPending } = useSignIn(signIn, {
		onError: (error) => {
			form.setError('root', {
				message: error.message,
			})
		},
		onSuccess: () => {
			form.reset()
			push('/dashboard')
		},
	})

	const onSubmit = (data: SignInFormData) => {
		execute(data)
	}

	return (
		<AuthBox>
			<AuthBoxHeader title="Entrar" description="" />

			<Form {...form}>
				<form
					className="flex flex-col gap-10"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="grid gap-6">
						{form.formState.errors.root && (
							<Alert variant="destructive">
								<AlertTitle>Invalid login credentials</AlertTitle>
								<AlertDescription>
									{form.formState.errors.root.message}
								</AlertDescription>
							</Alert>
						)}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							type="submit"
							className="w-full"
							disabled={!form.formState.isValid}
						>
							{isPending ? 'Entrando...' : 'Entrar'}
						</Button>
					</div>
				</form>
			</Form>

			<AuthSeparator />

			<AuthBoxFooter>
				<Button variant="outline" className="w-full">
					<ProviderGoogleIcon />
					Google
				</Button>

				<div className="text-center text-sm">
					Não tem uma conta?{' '}
					<Anchor href="/auth/register" prefetch>
						Cadastre-se
					</Anchor>
				</div>
			</AuthBoxFooter>
		</AuthBox>
	)
}
