'use client'

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { Button } from '@components/ui/button'
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
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { resetPasswordServer } from '@/modules/auth/reset-password/reset-password-action'

const schema = z.object({
	email: z.email({
		message: 'Por favor, insira um endereço de email válido.',
	}),
})

export type ResetPasswordFormData = z.infer<typeof schema>

export function ResetPasswordForm() {
	const [isPending, setIsPending] = useState(false)

	const form = useForm<ResetPasswordFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: '',
		},
	})

	const onSubmit = async (data: ResetPasswordFormData) => {
		setIsPending(true)
		const { error } = await resetPasswordServer({ email: data.email })

		if (error) {
			setIsPending(false)
			form.setError('root', {
				message: 'Erro ao enviar email de recuperação.',
			})
		}

		if (!error) {
			setIsPending(false)
			form.reset()
			toast.success(
				'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.',
			)
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
							<AlertTitle>Erro ao enviar email</AlertTitle>
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
					<Button
						type="submit"
						className="w-full"
						disabled={!form.formState.isValid}
					>
						{isPending ? 'Enviando...' : 'Enviar'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
