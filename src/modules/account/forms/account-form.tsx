import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
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
import { OAB_STATES } from '@constants/content'
import { useMemo } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'


// Account form values type
export type AccountFormValues = {
	displayName?: string | null
	email?: string | null
	phoneNumber?: string | null
	oabNumber?: string | null
	oabState?: string | null
}

interface AccountFormProps {
	form: UseFormReturn<AccountFormValues>
	formId: string
}

export function AccountForm({ form, formId }: AccountFormProps) {
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
										type="text"
										placeholder="Como você prefere ser chamado?"
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
										type="email"
										placeholder="seu@email.com"
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
										placeholder="(00) 99999-9999"
									/>
								</FormControl>
								{fieldState.invalid && (
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
									<FormLabel htmlFor={field.name}>Número da OAB</FormLabel>
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
							name="oabState"
							render={({ field, fieldState }) => (
								<Field>
									<FormLabel htmlFor={field.name}>Estado da OAB</FormLabel>
									<FormControl>
										<Select
											value={field.value || ''}
											onValueChange={field.onChange}
										>
											<SelectTrigger id={field.name}>
												<SelectValue placeholder="Selecione" />
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
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</div>
				</FieldGroup>
			</form>
		</Form>
	)
}
