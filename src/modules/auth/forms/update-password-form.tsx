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
import z from 'zod'
import { updatePassword } from '../actions'

const schema = z
	.object({
		password: z.string().min(6, {
			message: 'A senha deve ter pelo menos 6 caracteres.',
		}),
		confirmPassword: z.string().min(6, {
			message: 'A senha deve ter pelo menos 6 caracteres.',
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'As senhas não coincidem.',
		path: ['confirmPassword'],
	})

export type UpdatePasswordFormData = z.infer<typeof schema>

export function UpdatePasswordForm() {
	const [isPending, setIsPending] = useState(false)
	const form = useForm<UpdatePasswordFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (data: UpdatePasswordFormData) => {
		setIsPending(true)

		const { user, error } = await updatePassword({ password: data.password })

		if (error) {
			setIsPending(false)
			form.setError('root', {
				message: 'Erro ao atualizar senha.',
			})
		}

		if (user) {
			setIsPending(false)
			form.reset()
			toast.success('Senha atualizada com sucesso!')
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
							<AlertTitle>Erro ao atualizar senha</AlertTitle>
							<AlertDescription>
								{form.formState.errors.root.message}
							</AlertDescription>
						</Alert>
					)}
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nova Senha</FormLabel>
								<FormControl>
									<Input type="password" placeholder="" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirmar Nova Senha</FormLabel>
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
						{isPending ? 'Atualizando...' : 'Solicitar atualização'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
