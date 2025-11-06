'use client'

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { Card, CardContent, CardHeader } from '@components/ui/card'
import { Field, FieldError, FieldGroup } from '@components/ui/field'
import { Form, FormControl, FormLabel } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { PhoneInput } from '@components/ui/phone-input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@components/ui/select'
import {
	StepperFooter,
	StepperHeader,
	StepperNextButton,
} from '@components/ui/stepper'

import { OAB_STATES } from '@constants/oab-states'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStepper } from '@hooks/use-stepper'
import { insertAccountAction } from '@modules/account/actions/mutations/insert-account.action'
import { updateAccountAction } from '@modules/account/actions/mutations/update-account.action'
import { useId, useMemo, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

const schema = z.object({
	displayName: z.string().min(1, 'Nome é obrigatório'),
	phoneNumber: z.string().nullable().optional(),
	oabNumber: z.string().min(1, 'Preencha o número da OAB'),
	oabState: z.string().min(1, 'Escolha o estado da OAB'),
})

type FormData = z.input<typeof schema>

export interface AccountStepFormProps {
	accountId?: string
	initialValues: FormData
}

export function AccountStepForm({
	accountId,
	initialValues,
}: AccountStepFormProps) {
	const formId = useId()
	const [isPending, startTransition] = useTransition()

	const { nextStep } = useStepper()

	const defaultValues = useMemo(() => {
		return {
			displayName: initialValues?.displayName,
			phoneNumber: initialValues?.phoneNumber,
			oabNumber: initialValues?.oabNumber,
			oabState: initialValues?.oabState,
		}
	}, [initialValues])

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues,
	})

	const onSubmit = (formData: FormData) => {
		startTransition(async () => {
			const insertAccount = {
				displayName: formData.displayName,
				phoneNumber: formData.oabNumber ?? null,
				oabNumber: formData.oabNumber,
				oabState: formData.oabState,
			}

			if (accountId) {
				const { error, success, message } = await updateAccountAction({
					accountId,
					data: insertAccount,
				})

				if (error || !success) {
					form.setError('root', {
						message: message || 'Ocorreu um erro, tente novamente mais tarde.',
					})
				}

				if (success) {
					nextStep()
				}
			}

			const { error, success, message } =
				await insertAccountAction(insertAccount)

			if (error || !success) {
				form.setError('root', {
					message: message || 'Ocorreu um erro, tente novamente mais tarde.',
				})
			}

			if (success) {
				nextStep()
			}
		})
	}

	return (
		<>
			<Card>
				<CardHeader>
					<StepperHeader title="Conta" description="Dados da sua conta" />
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							id={formId}
							className="grid gap-4"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							{form.formState.errors.root && (
								<Alert variant="destructive">
									<AlertTitle>Error</AlertTitle>
									<AlertDescription>
										{form.formState.errors.root.message}
									</AlertDescription>
								</Alert>
							)}

							<FieldGroup>
								<Controller
									control={form.control}
									name="displayName"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FormLabel htmlFor={field.name}>
												Nome <span className="text-red-400">*</span>
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													id={field.name}
													placeholder=""
													data-invalid={fieldState.invalid}
													value={field.value}
												/>
											</FormControl>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								<Controller
									control={form.control}
									name="phoneNumber"
									render={({ field, fieldState }) => (
										<Field>
											<FormLabel htmlFor={field.name}>Telefone</FormLabel>
											<FormControl>
												<PhoneInput
													{...field}
													id={field.name}
													placeholder=""
													value={field.value ?? undefined}
												/>
											</FormControl>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								<div className="grid grid-cols-2 gap-4">
									<Controller
										control={form.control}
										name="oabNumber"
										render={({ field, fieldState }) => (
											<Field>
												<FormLabel htmlFor={field.name}>Número OAB</FormLabel>
												<FormControl>
													<Input
														{...field}
														id={field.name}
														placeholder=""
														value={field.value}
													/>
												</FormControl>
												{fieldState.error && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>

									<Controller
										control={form.control}
										name="oabState"
										render={({ field, fieldState }) => (
											<Field>
												<FormLabel htmlFor={field.name}>Estado OAB</FormLabel>
												<FormControl>
													<Select
														value={field.value}
														onValueChange={field.onChange}
													>
														<SelectTrigger id={field.name}>
															<SelectValue placeholder="" />
														</SelectTrigger>
														<SelectContent>
															{OAB_STATES.map((state) => (
																<SelectItem key={state} value={state}>
																	{state}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												{fieldState.error && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>
								</div>
							</FieldGroup>
						</form>
					</Form>
				</CardContent>
			</Card>

			<StepperFooter>
				<StepperNextButton
					type="submit"
					form={formId}
					disabled={isPending}
					preventDefault={true}
				/>
			</StepperFooter>
		</>
	)
}
