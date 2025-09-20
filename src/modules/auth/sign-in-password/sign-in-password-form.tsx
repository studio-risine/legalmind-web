'use client'

import { Button } from '@components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiErrorWarningFill } from '@remixicon/react'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Anchor } from '@/components/ui/anchor'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signInWithPassword } from './sign-in-password-action'

const schema = z.object({
	email: z.email({
		message: 'Por favor, insira um endereço de e-mail válido.',
	}),
	password: z.string().min(6, {
		message: 'A senha deve ter pelo menos 6 caracteres.',
	}),
})

export type SignInFormData = z.infer<typeof schema>

export function SignInPasswordForm() {
	const [isPending, startTransition] = useTransition()
	const form = useForm<SignInFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: SignInFormData) => {
		const { error } = await signInWithPassword(data)

		if (error) {
			startTransition(() => {
				form.setError('root', {
					message: error?.message ?? 'Verifique suas credenciais.',
				})
			})
		}
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-10"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="grid gap-6">
					{form.formState.errors.root && (
						<Alert variant="destructive">
							<RiErrorWarningFill />
							<AlertTitle>Alert</AlertTitle>
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
								<div className="flex justify-between gap-2">
									<FormLabel>Senha</FormLabel>
									<Anchor href="/account/reset-password" className="text-sm">
										Esqueceu sua senha?
									</Anchor>
								</div>
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
	)
}
