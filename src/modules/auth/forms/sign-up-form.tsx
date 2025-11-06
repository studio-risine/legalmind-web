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
import { emailSchemaDefault, passwordSchema } from '@libs/zod/schemas/defaults'
import { useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { signUpWithEmail } from '../actions'
import { SubmitButton } from '../components/submit-button'

const formSchema = z.object({
	email: emailSchemaDefault,
	password: passwordSchema,
})

export type SignUpFormData = z.input<typeof formSchema>

export function SignUpForm() {
	const [isPending, startTransition] = useTransition()

	const form = useForm<SignUpFormData>({
		resolver: zodResolver(formSchema),
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

	const onSubmit = (formData: SignUpFormData) => {
		startTransition(async () => {
			const result = await signUpWithEmail(formData)

			if (result.errors) {
				form.setError('root', {
					message: result.message || 'Erro ao criar conta.',
				})
			}

			if (result.success) {
				toast.success('Conta criada com sucesso!')

				await new Promise((resolve) => setTimeout(resolve, 1000))
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
										type="email"
										placeholder=""
										autoComplete="email"
										disabled={isPending}
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
										disabled={isPending}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<SubmitButton
						text="Criar"
						disabled={isPending}
						isLoading={isPending}
						textLoading="Criando..."
					/>
				</div>
			</form>
		</Form>
	)
}
