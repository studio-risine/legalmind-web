'use client'

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert'
import { Card, CardContent, CardHeader } from '@components/ui/card'
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
import {
	StepperFooter,
	StepperHeader,
	StepperNextButton,
	StepperPreviuesButton,
} from '@components/ui/stepper'
import { Textarea } from '@components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { spaceTypeEnum } from '@infra/db/schemas'
import { createSpaceAction } from '@modules/space/actions/mutations/insert-space.action'
import { createSelectSchema } from 'drizzle-zod'
import { useRouter } from 'next/navigation'
import { useId, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

const schema = z.object({
	spaceDescription: z.string().optional(),
	spaceName: z
		.string()
		.min(2, 'O nome do space é obrigatório e deve ter ao menos 2 caracteres'),
	spaceType: createSelectSchema(spaceTypeEnum).optional(),
})

const spaceTypeLabels: Record<
	(typeof spaceTypeEnum.enumValues)[number],
	string
> = {
	DEPARTMENT: 'Departamento',
	FIRM: 'Escritório',
	INDIVIDUAL: 'Individual',
}

const SPACE_TYPES = spaceTypeEnum.enumValues.map((value) => ({
	label: spaceTypeLabels[value],
	value,
}))

type FormData = z.infer<typeof schema>

interface SpaceStepFormProps {
	accountId?: string
}

export function SpaceStepForm({ accountId }: SpaceStepFormProps) {
	const [isPending, startTransition] = useTransition()

	const formId = useId()
	const router = useRouter()

	const form = useForm<FormData>({
		defaultValues: {
			spaceDescription: '',
			spaceName: '',
			spaceType: 'INDIVIDUAL',
		},
		resolver: zodResolver(schema),
	})

	const onSubmit = (formData: FormData) => {
		if (!accountId) {
			form.setError('root', {
				message: 'Conta não encontrada. Por favor, volte e crie sua conta.',
			})
			return
		}

		startTransition(async () => {
			const {
				error,
				success,
				message,
				data: spaceId,
			} = await createSpaceAction({
				accountId,
				description: formData.spaceDescription,
				name: formData.spaceName,
				type: formData.spaceType ?? 'INDIVIDUAL',
			})

			if (error || !success) {
				form.setError('root', {
					message: message || 'Ocorreu um erro, tente novamente mais tarde.',
				})
			}

			if (success && spaceId) {
				router.push(`/space/${spaceId}`)
			}
		})
	}

	return (
		<>
			<Card>
				<CardHeader>
					<StepperHeader
						description="Escolha o nome do seu space"
						title="Space"
					/>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							className="grid gap-4"
							id={formId}
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
									name="spaceName"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FormLabel htmlFor={field.name}>
												Nome
												<span className="text-red-400">*</span>
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													data-invalid={fieldState.invalid}
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
									name="spaceType"
									render={({ field, fieldState }) => (
										<Field>
											<FormLabel htmlFor={field.name}>Tipo</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<SelectTrigger id={field.name}>
														<SelectValue placeholder="" />
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
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								<Controller
									control={form.control}
									name="spaceDescription"
									render={({ field, fieldState }) => (
										<Field>
											<FormLabel htmlFor={field.name}>Descrição</FormLabel>
											<FormControl>
												<Textarea
													{...field}
													id={field.name}
													placeholder=""
													rows={3}
													value={field.value}
												/>
											</FormControl>
											{fieldState.error && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</FieldGroup>
						</form>
					</Form>
				</CardContent>
			</Card>

			<StepperFooter>
				<div className="flex gap-2">
					<StepperPreviuesButton />
					<StepperNextButton
						disabled={isPending}
						form={formId}
						preventDefault
						type="submit"
					/>
				</div>
			</StepperFooter>
		</>
	)
}
