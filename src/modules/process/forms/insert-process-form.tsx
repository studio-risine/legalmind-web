'use client'

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
import { zodResolver } from '@hookform/resolvers/zod'
import { processStatusEnum } from '@infra/db/schemas'
import { titleSchemaDefault } from '@libs/zod/schemas/defaults'
import { queryClientsAction } from '@modules/client/actions/queries/query-clients.action'
import { insertProcessAction } from '@modules/process/actions/mutations/insert-process.action'
import { maskProcessNumber } from '@utils/formatters'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

const schema = z.object({
	clientId: z.uuid('Cliente inválido'),
	title: titleSchemaDefault.describe('Título do processo'),
	description: z.string().optional(),
	processNumber: z
		.string({
			message: 'Processo com formato inválido',
		})
		.min(20, 'Número do processo deve ter 20 dígitos')
		.max(25, 'Número do processo inválido')
		.regex(/^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/),
	status: z.enum(processStatusEnum.enumValues).default('ACTIVE'),
})

type FormData = z.input<typeof schema>

interface InsertProcessFormProps {
	formId: string
	onSuccess?: (processId?: string) => void
}

export function InsertProcessForm({
	formId,
	onSuccess,
}: InsertProcessFormProps) {
	const { id: spaceId } = useParams<{ id: string }>()
	const [clients, setClients] = useState<Array<{ id: string; name: string }>>(
		[],
	)

	const [isPending, startTransition] = useTransition()

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			clientId: '',
			title: '',
			processNumber: '',
			description: '',
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
			const { error, success, message, data } = await insertProcessAction({
				spaceId,
				clientId: formData.clientId,
				title: formData.title,
				description: formData.description || undefined,
				processNumber: formData.processNumber,
				status: formData.status ?? 'ACTIVE',
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
				toast.success('Processo criado com sucesso!')
			}
		})
	}

	useEffect(() => {
		const loadClients = async () => {
			const { data, success } = await queryClientsAction({ spaceId })

			if (!success) {
				setClients([])
				return
			}

			const clients =
				data?.clients.map((client) => ({
					id: client.id,
					name: client.name,
				})) || []

			setClients(clients)
		}

		loadClients()
	}, [spaceId])

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
										placeholder="Ex: Ação de cobrança"
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
						name="processNumber"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>
									Número do Processo (CNJ){' '}
									<span className="text-red-400">*</span>
								</FormLabel>
								<FormControl>
									<Input
										{...field}
										id={field.name}
										type="text"
										placeholder="0000000-00.0000.0.00.0000"
										aria-invalid={fieldState.invalid}
										value={maskProcessNumber(field.value) || ''}
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
						name="clientId"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>
									Cliente <span className="text-red-400">*</span>
								</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value}
									disabled={isPending}
								>
									<FormControl>
										<SelectTrigger aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Selecione um cliente" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{clients?.map((client) => (
											<SelectItem key={client.id} value={client.id}>
												{client.name}
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

					<Controller
						control={form.control}
						name="status"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>
									Status <span className="text-red-400">*</span>
								</FormLabel>
								<Select
									onValueChange={field.onChange}
									value={field.value}
									disabled={isPending}
								>
									<FormControl>
										<SelectTrigger aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Selecione um status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="PENDING">Pendente</SelectItem>
										<SelectItem value="ACTIVE">Ativo</SelectItem>
										<SelectItem value="SUSPENDED">Suspenso</SelectItem>
										<SelectItem value="ARCHIVED">Arquivado</SelectItem>
										<SelectItem value="CLOSED">Encerrado</SelectItem>
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
						name="description"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FormLabel htmlFor={field.name}>Descrição</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										id={field.name}
										placeholder="Descrição do processo..."
										aria-invalid={fieldState.invalid}
										value={field.value || ''}
										disabled={isPending}
										rows={4}
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
