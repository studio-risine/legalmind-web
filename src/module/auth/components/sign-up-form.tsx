'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'
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
import { AuthBox, AuthBoxFooter, AuthBoxHeader } from './auth-box'
import { AuthSeparator } from './auth-separator'
import { ProviderGoogleIcon } from './provide-google-icon'

const _schema = z.object({
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
	confirmPassword: z.string().min(6, {
		message: 'A senha deve ter pelo menos 6 caracteres.',
	}),
})

type SignUpFormData = z.infer<typeof _schema>

export function SignUpForm() {
	const form = useForm<SignUpFormData>({
		resolver: zodResolver(_schema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: SignUpFormData) => {
		console.log(data)
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
						<Button type="submit" className="w-full">
							Criar
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
						<Anchor href="/sign-in" prefetch>
							Entrar
						</Anchor>
					</p>
				</div>
			</AuthBoxFooter>
		</AuthBox>
	)
}
