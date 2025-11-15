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
import { useResetPasswordCooldown } from '@hooks/use-reset-password-cooldown'
import { CooldownTimer } from '@modules/auth/components'
import { RiErrorWarningFill } from '@remixicon/react'
import { useCallback, useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { resetPasswordServer } from '../actions'
import { SubmitButton } from '../components/submit-button'

const schema = z.object({
	email: z.email({
		message: 'Por favor, insira um endereço de email válido.',
	}),
})

export type ResetPasswordFormData = z.infer<typeof schema>

export function ResetPasswordForm() {
	const [isPending, startTransition] = useTransition()
	const { isOnCooldown, remainingTime, canSubmit, startCooldown } =
		useResetPasswordCooldown()

	const form = useForm<ResetPasswordFormData>({
		defaultValues: {
			email: '',
		},
		resolver: zodResolver(schema),
	})

	const formState = useMemo(
		() => ({
			errors: form.formState.errors,
			isValid: form.formState.isValid,
		}),
		[form.formState.isValid, form.formState.errors],
	)

	const isButtonDisabled = useMemo(() => {
		return !formState.isValid || !canSubmit || isPending
	}, [formState.isValid, canSubmit, isPending])

	const onSubmit = useCallback(
		async (data: ResetPasswordFormData) => {
			if (!canSubmit || isPending) {
				return
			}

			startTransition(async () => {
				const { error, onSuccess } = await resetPasswordServer({
					email: data.email,
				})

				if (error) {
					form.setError('root', {
						message: error?.message ?? 'Erro ao enviar email de recuperação.',
					})
					return
				}

				if (onSuccess) {
					startCooldown()
					form.reset()

					toast.success('Email de recuperação enviado com sucesso!', {
						description: 'Verifique sua caixa de entrada.',
					})
				}
			})
		},
		[canSubmit, isPending, form, startCooldown],
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
							<AlertTitle>Erro</AlertTitle>
							<AlertDescription>
								{formState.errors.root.message}
							</AlertDescription>
						</Alert>
					)}

					{isOnCooldown && <CooldownTimer remainingTime={remainingTime} />}

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										disabled={isOnCooldown || isPending}
										placeholder="Digite seu email"
										type="email"
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
						text="Enviar"
						textLoading="Enviando..."
					/>
				</div>
			</form>
		</Form>
	)
}
