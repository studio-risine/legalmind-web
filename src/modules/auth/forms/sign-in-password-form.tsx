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
import { emailSchemaDefault, passwordSchema } from '@libs/zod/schemas/defaults'
import { useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { signInWithPassword } from '../actions'
import { SubmitButton } from '../components/submit-button'

const formSchema = z.object({
	email: emailSchemaDefault,
	password: passwordSchema,
})

export type SignInFormData = z.input<typeof formSchema>

export function SignInPasswordForm() {
	const [isPending, startTransition] = useTransition()

	const form = useForm<SignInFormData>({
		defaultValues: {
			email: '',
			password: '',
		},
		resolver: zodResolver(formSchema),
	})

	const formState = useMemo(
		() => ({
			errors: form.formState.errors,
			isValid: form.formState.isValid,
		}),
		[form.formState.isValid, form.formState.errors],
	)

	const onSubmit = (formData: SignInFormData) => {
		startTransition(async () => {
			const result = await signInWithPassword(formData)

			if (result.errors) {
				form.setError('root', {
					message: result.message || 'Verifique suas credenciais.',
				})
			}
		})
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-10"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="grid gap-6">
					{formState.errors.root && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
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
										autoComplete="email"
										disabled={isPending}
										placeholder=""
										type="email"
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
									<Anchor className="text-sm" href="/account/reset-password">
										Esqueceu sua senha?
									</Anchor>
								</div>
								<FormControl>
									<Input
										autoComplete="current-password"
										disabled={isPending}
										placeholder=""
										type="password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<SubmitButton
						disabled={isPending}
						isLoading={isPending}
						text="Entrar"
						textLoading="Entrando..."
					/>
				</div>
			</form>
		</Form>
	)
}
