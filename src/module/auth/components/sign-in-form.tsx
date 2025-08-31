'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { cn } from '@/lib/utils'
import { AuthBox, AuthBoxFooter, AuthBoxHeader } from './auth-box'
import { AuthSeparator } from './auth-separator'
import { ProviderGoogleIcon } from './provide-google-icon'

const _schema = z.object({
	email: z.email({
		message: 'Por favor, insira um endereço de e-mail válido.',
	}),
	password: z.string().min(6, {
		message: 'A senha deve ter pelo menos 6 caracteres.',
	}),
})

type SignInFormData = z.infer<typeof _schema>

interface SignInFormProps {
	className?: string
}

export function SignInForm({ className }: SignInFormProps) {
	const form = useForm<SignInFormData>({
		resolver: zodResolver(_schema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: SignInFormData) => {
		console.log(data)
	}

	return (
		<AuthBox>
			<AuthBoxHeader title="Entrar" description="" />

			<Form {...form}>
				<form
					className={cn('flex flex-col gap-10', className)}
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<div className="grid gap-6">
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
							Entrar
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
					<Anchor href="/sign-up" prefetch>
						Cadastre-se
					</Anchor>
				</div>
			</AuthBoxFooter>
		</AuthBox>
	)
}
