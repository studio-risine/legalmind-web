import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { DocumentInput } from '@components/ui/document-input'
import { Form, FormControl, FormLabel } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { PhoneInput } from '@components/ui/phone-input'
import { useMemo } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'

// Narrow, local form values type to avoid deep generic instantiation issues
export type ClientFormValues = {
	name: string
	document?: string | null
	email?: string | null
	phone?: string | null
}

interface ClientFormProps {
	form: UseFormReturn<ClientFormValues>
	formId: string
}

export function ClientForm({ form, formId }: ClientFormProps) {
	const formState = useMemo(
		() => ({
			isValid: form.formState.isValid,
			errors: form.formState.errors,
		}),
		[form.formState.isValid, form.formState.errors],
	)

	return (
		<Form {...form}>
			<form className="grid gap-4" id={formId}>
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
						name="document"
						render={({ field, fieldState }) => (
							<Field>
								<FormLabel htmlFor={field.name}>
									Documento (CPF ou CNPJ)
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
								<FormLabel htmlFor={field.name}>Email</FormLabel>
								<FormControl>
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										type="email"
										placeholder=""
										value={field.value || ''}
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
						name="phone"
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
