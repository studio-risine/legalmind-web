'use client'

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { DocumentInput } from '@components/ui/document-input'
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
import { zodResolver } from '@hookform/resolvers/zod'
import {
	type ClientStatus,
	type ClientTypes,
	clientStatusSchema,
	clientTypesSchema,
} from '@infra/db/schemas'
import {
	emailSchemaDefault,
	nameSchemaDefault,
} from '@libs/zod/schemas/defaults'
import { createClientAction } from '@modules/client/actions'
import { clientStatusMap } from '@modules/client/components/status-badge'
import { useMemo, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

export type ClientFormValues = {
	name: string
	documentNumber: string
	email: string
	phoneNumber?: string | null
	type: ClientTypes
	status: ClientStatus
}

const schema = z.object({
	name: nameSchemaDefault,
	documentNumber: z.string().min(11, 'CPF/CNPJ inválido').max(18),
	email: emailSchemaDefault,
	phoneNumber: z.string().nullable().optional(),
	type: clientTypesSchema,
	status: clientStatusSchema,
})

type FormData = z.input<typeof schema>

interface InsertClientFormProps {
	spaceId: string
	formId: string
	onSuccess?: (clientId?: string) => void
}

export function InsertClientForm({
	formId,
	spaceId,
	onSuccess,
}: InsertClientFormProps) {
	const [isPending, startTransition] = useTransition()

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			type: 'INDIVIDUAL',
			status: 'ACTIVE',
		},
	})

	const formState = useMemo(
		() => ({
			isValid: form.formState.isValid,
			errors: form.formState.errors,
		}),
		[form.formState.isValid, form.formState.errors],
	)

	const onSubmit = (formData: FormData) => {
		startTransition(async () => {
			const { error, success, message, data } = await createClientAction({
				spaceId,
				name: formData.name,
				email: formData.email,
				phoneNumber: formData.phoneNumber ?? undefined,
				type: formData.type,
				documentNumber: formData.documentNumber,
				status: formData.status,
			})

			if (error || !success) {
				form.setError('root', {
					message: message || 'Ocorreu um erro, tente novamente mais tarde.',
				})

				return
			}

			if (success) {
				onSuccess?.(data as string | undefined)
				form.reset()
				toast.success('Cliente criado com sucesso!')
			}
		})
	}

	return (
		<Form {...form}>
			<form
				className="grid gap-4"
				id={formId}
				onSubmit={form.handleSubmit(onSubmit)}
			>
				{formState.errors.root && (
					<Alert variant="destructive">
						<AlertTitle>Erro</AlertTitle>
						<AlertDescription>{formState.errors.root.message}</AlertDescription>
					</Alert>
				)}

				<FieldGroup>
					<Controller
						control={form.control}
						name="name"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>
									Nome <span className="text-red-400">*</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										id={field.name}
										type="text"
										placeholder=""
										aria-invalid={fieldState.invalid}
										value={field.value || ''}
										disabled={isPending}
									/>
								</FormControl>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<Controller
						control={form.control}
						name="documentNumber"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>
									Documento (CPF ou CNPJ){' '}
									<span className="text-red-400">*</span>
								</FormLabel>
								<FormControl>
									<DocumentInput
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										value={field.value || ''}
										onChange={field.onChange}
										returnUnformatted={true}
										placeholder=""
										disabled={isPending}
									/>
								</FormControl>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<Controller
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>
									Email <span className="text-red-400">*</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										type="email"
										placeholder=""
										value={field.value || ''}
										disabled={isPending}
									/>
								</FormControl>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<div className="flex gap-4">
						<Controller
							control={form.control}
							name="type"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FormLabel htmlFor={field.name}>
										Tipo <span className="text-red-400">*</span>
									</FormLabel>
									<FormControl>
										<Select
											value={field.value || ''}
											onValueChange={field.onChange}
										>
											<SelectTrigger
												aria-invalid={fieldState.invalid}
												disabled={isPending}
											>
												<SelectValue placeholder="Selecione o tipo" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="INDIVIDUAL">
													Pessoa Física
												</SelectItem>
												<SelectItem value="COMPANY">Pessoa Jurídica</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<Controller
							control={form.control}
							name="status"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FormLabel htmlFor={field.name}>
										Status <span className="text-red-400">*</span>
									</FormLabel>
									<FormControl>
										<Select
											value={field.value || ''}
											onValueChange={field.onChange}
										>
											<SelectTrigger
												aria-invalid={fieldState.invalid}
												disabled={isPending}
											>
												<SelectValue placeholder="Selecione o status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="LEAD">
													{clientStatusMap.LEAD}
												</SelectItem>
												<SelectItem value="PROSPECT">
													{clientStatusMap.PROSPECT}
												</SelectItem>
												<SelectItem value="ACTIVE">
													{clientStatusMap.ACTIVE}
												</SelectItem>
												<SelectItem value="INACTIVE">
													{clientStatusMap.INACTIVE}
												</SelectItem>
												<SelectItem value="ARCHIVED">
													{clientStatusMap.ARCHIVED}
												</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</div>

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
										aria-invalid={fieldState.invalid}
										value={field.value || ''}
										onChange={field.onChange}
										returnUnformatted={true}
										placeholder=""
										disabled={isPending}
									/>
								</FormControl>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</FieldGroup>
			</form>
		</Form>
	)
}
