'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import z from 'zod'
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
import { signUp } from './sign-up-action'
import { useSignUp } from './use-sign-up'

const schema = z.object({
	firstName: z.string().min(1, {
		message: 'Por favor, insira seu nome.',
	}),
	lastName: z.string().min(1, {
		message: 'Por favor, insira seu sobrenome.',
	}),
	email: z.email({
		message: 'Por favor, insira um endereço de email válido.',
	}),
	password: z.string().min(6, {
		message: 'A senha deve ter pelo menos 6 caracteres.',
	}),
})

export type SignUpFormData = z.infer<typeof schema>

export function SignUpForm() {
	const { push } = useRouter()
	const form = useForm<SignUpFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
		},
	})

	const { execute, isPending, isSuccess } = useSignUp(signUp, {
		onSuccess: () => {
			console.log(isSuccess)
			form.reset()
			push('/auth/login')
		},
		onError: (error) => {
			form.setError('root', {
				type: 'manual',
				message: error.message,
			})
		},
	})

	const onSubmit = (data: SignUpFormData) => {
		execute(data)
	}

	return (
		<AuthBox>
			<AuthBoxHeader title="Crie uma conta" description="" />

			<Form {...form}>
				<form
					className="flex flex-col gap-10"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="grid gap-6">
						{form.formState.errors.root && (
							<Alert variant="destructive">
								<AlertTitle>Invalid credentials</AlertTitle>
								<AlertDescription>
									{form.formState.errors.root.message}
								</AlertDescription>
							</Alert>
						)}
						<div className="flex gap-4 lg:gap-6">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome</FormLabel>
										<FormControl>
											<Input type="text" placeholder="" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sobrenome</FormLabel>
										<FormControl>
											<Input type="text" placeholder="" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
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
							{isPending ? 'Criando...' : 'Criar'}
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
					<p className="text-muted-foreground">
						Já tem uma conta?{' '}
						<Anchor href="/auth/login" prefetch>
							Entrar
						</Anchor>
					</p>
				</div>
			</AuthBoxFooter>
		</AuthBox>
	)
}
