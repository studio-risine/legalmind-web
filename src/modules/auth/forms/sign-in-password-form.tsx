'use client'

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { Anchor } from '@components/ui/anchor'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@components/ui/form'
import { Input } from '@components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { RiErrorWarningFill } from '@remixicon/react'
import { useCallback, useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { signInWithPassword } from '../actions'
import { SubmitButton } from '../components/submit-button'

const schema = z.object({
	email: z.email({
		message: 'Por favor, insira um endereço de e-mail válido.',
	}),
	password: z.string().min(6, {
		message: 'A senha deve ter pelo menos 6 caracteres.',
	}),
})

export type SignInFormData = z.input<typeof schema>

export function SignInPasswordForm() {
	const [isPending, startTransition] = useTransition()

	const form = useForm<SignInFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const formState = useMemo(
		() => ({
			isValid: form.formState.isValid,
			errors: form.formState.errors,
		}),
		[form.formState.isValid, form.formState.errors],
	)

	const isButtonDisabled = useMemo(() => {
		return !formState.isValid || isPending
	}, [formState.isValid, isPending])

	const onSubmit = useCallback(
		(data: SignInFormData) => {
			if (!formState.isValid || isPending) {
				return
			}

			startTransition(async () => {
				const { error } = await signInWithPassword(data)

				if (error) {
					form.setError('root', {
						message: error?.message ?? 'Verifique suas credenciais.',
					})
				}
			})
		},
		[form, formState, isPending],
	)

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-10"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="grid gap-6">
					{formState.errors.root && (
						<Alert variant="destructive">
							<RiErrorWarningFill />
							<AlertTitle>Erro ao Entrar</AlertTitle>
							<AlertDescription>
								{formState.errors.root.message}
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
									<Input
										type="email"
										placeholder=""
										autoComplete="email"
										{...field}
									/>
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
									<Input
										type="password"
										placeholder=""
										autoComplete="current-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<SubmitButton
						disabled={isButtonDisabled}
						isLoading={isPending}
						text="Entrar"
						textLoading="Entrando..."
					/>
				</div>
			</form>
		</Form>
	)
}
