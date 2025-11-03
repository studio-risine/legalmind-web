'use client'

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
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
import { useCallback, useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { signUpWithEmail } from '../actions'
import { SubmitButton } from '../components/submit-button'

const formSchema = z.object({
	displayName: z.string().min(1, {
		message: 'Por favor, insira seu nome.',
	}),
	email: z.email({
		message: 'Por favor, insira um endereço de email válido.',
	}),
	password: z.string().min(6, {
		message: 'A senha deve ter pelo menos 6 caracteres.',
	}),
})

export type SignUpFormData = z.infer<typeof formSchema>

export function SignUpForm() {
	const [isPending, startTransition] = useTransition()

	const form = useForm<SignUpFormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: '',
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
		(data: SignUpFormData) => {
			startTransition(async () => {
				const { user, error } = await signUpWithEmail({
					displayName: data.displayName,
					email: data.email,
					password: data.password,
				})

				if (error) {
					form.setError('root', {
						message: 'Erro ao criar conta.',
					})
				}

				if (user) {
					toast.success('Conta criada com sucesso!', {
						description: 'Verifique sua caixa de e-mail para ativar sua conta.',
					})
					await new Promise((resolve) => setTimeout(resolve, 2 * 1000))
					form.reset()
				}
			})
		},
		[form],
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
							<AlertTitle>Invalid credentials</AlertTitle>
							<AlertDescription>
								{formState.errors.root.message}
							</AlertDescription>
						</Alert>
					)}
					<FormField
						control={form.control}
						name="displayName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nome</FormLabel>
								<FormControl>
									<Input
										type="text"
										placeholder=""
										autoComplete="given-name"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
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
								<FormLabel>Senha</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder=""
										autoComplete="new-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<SubmitButton
						text="Criar"
						disabled={isButtonDisabled}
						isLoading={isPending}
						textLoading="Criando..."
					/>
				</div>
			</form>
		</Form>
	)
}
