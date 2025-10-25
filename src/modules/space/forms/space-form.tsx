import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { Field, FieldError, FieldGroup } from '@components/ui/field'
import { Form, FormControl, FormLabel } from '@components/ui/form'
import { Input } from '@components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import { spaceTypeEnum } from '@infra/db/schemas'
import { useMemo } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'

const spaceTypeLabels: Record<typeof spaceTypeEnum.enumValues[number], string> = {
	INDIVIDUAL: 'Individual',
	FIRM: 'Escritório',
	DEPARTMENT: 'Departamento',
}

const SPACE_TYPES = spaceTypeEnum.enumValues.map((value) => ({
	value,
	label: spaceTypeLabels[value],
}))

export type SpaceFormValues = {
	name: string
	type?: typeof spaceTypeEnum.enumValues[number]
	description?: string
}

interface SpaceFormProps {
	form: UseFormReturn<SpaceFormValues>
	formId: string
}

export function SpaceForm({ form, formId }: SpaceFormProps) {
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
									Área de trabalho <span className="text-red-400">*</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										id={field.name}
										type="text"
										placeholder="Ex: Escritório Dr. Silva"
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
						name="type"
						render={({ field, fieldState }) => (
							<Field>
								<FormLabel htmlFor={field.name}>Tipo de workspace</FormLabel>
								<FormControl>
									<Select
										value={field.value || 'INDIVIDUAL'}
										onValueChange={field.onChange}
									>
										<SelectTrigger id={field.name}>
											<SelectValue placeholder="Selecione o tipo" />
										</SelectTrigger>
										<SelectContent>
											{SPACE_TYPES.map((type) => (
												<SelectItem key={type.value} value={type.value}>
													{type.label}
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

					<Controller
						control={form.control}
						name="description"
						render={({ field, fieldState }) => (
							<Field>
								<FormLabel htmlFor={field.name}>Descrição (opcional)</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										id={field.name}
										placeholder="Descreva seu workspace..."
										aria-invalid={fieldState.invalid}
										value={field.value || ''}
										rows={3}
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
