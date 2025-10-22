import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { DocumentInput } from '@components/ui/document-input'
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
import { PROCESS_STATUS } from '@constants/process'
import { useClientsList } from '@modules/client/hooks/use-client-queries'
import { useMemo } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'

export type ProcessFormValues = {
	title: string
	cnj?: string | null | undefined
	court?: string | null | undefined
	clientId?: string | null | undefined
	status?: string | null | undefined
}

interface ProcessFormProps {
	form: UseFormReturn<ProcessFormValues>
	formId: string
}

export function ProcessForm({ form, formId }: ProcessFormProps) {
	const { data: clientsData, isLoading: isLoadingClients } = useClientsList({})

	const formState = useMemo(
		() => ({
			isValid: form.formState.isValid,
			errors: form.formState.errors,
			isSubmitting: form.formState.isSubmitting,
		}),
		[
			form.formState.isValid,
			form.formState.errors,
			form.formState.isSubmitting,
		],
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
						name="title"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>
									Título <span className="text-red-400">*</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										id={field.name}
										type="text"
										placeholder="Ex: Ação de Cobrança, Inventário..."
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
						name="cnj"
						render={({ field, fieldState }) => (
							<Field>
								<FormLabel htmlFor={field.name}>CNJ</FormLabel>
								<FormControl>
									<DocumentInput
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										value={field.value || ''}
										onChange={field.onChange}
										returnUnformatted={true}
										placeholder="0000000-00.0000.0.00.0000"
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
						name="court"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>Tribunal</FormLabel>
								<FormControl>
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										type="text"
										placeholder="Ex: TJSP, TJRJ, STF..."
										value={field.value || ''}
									/>
								</FormControl>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</FieldGroup>

				<FieldGroup>
					<Controller
						control={form.control}
						name="clientId"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>Cliente</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value || ''}
									disabled={isLoadingClients}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue
												placeholder={
													isLoadingClients
														? 'Carregando clientes...'
														: 'Selecione um cliente'
												}
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{!isLoadingClients && clientsData?.client.length === 0 ? (
											<SelectItem value="" disabled>
												Nenhum cliente encontrado
											</SelectItem>
										) : (
											clientsData?.client.map((client) => (
												<SelectItem key={client.id} value={client.id}>
													{client.name}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
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
								<FormLabel htmlFor={field.name}>Status</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value || 'active'}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Selecione um status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{PROCESS_STATUS.map((status) => (
											<SelectItem key={status.value} value={status.value}>
												{status.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
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
