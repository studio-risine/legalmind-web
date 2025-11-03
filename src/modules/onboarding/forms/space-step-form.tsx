'use client'

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
import { createSpaceAction } from '@modules/space/actions'
import { createSelectSchema } from 'drizzle-zod'
import { useRouter } from 'next/navigation'
import { useId, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

const schema = z.object({
	spaceName: z
		.string()
		.min(2, 'O nome do space é obrigatório e deve ter ao menos 2 caracteres'),
	spaceType: createSelectSchema(spaceTypeEnum).optional(),
	spaceDescription: z.string().optional(),
})

const spaceTypeLabels: Record<
	(typeof spaceTypeEnum.enumValues)[number],
	string
> = {
	INDIVIDUAL: 'Individual',
	FIRM: 'Escritório',
	DEPARTMENT: 'Departamento',
}

const SPACE_TYPES = spaceTypeEnum.enumValues.map((value) => ({
	value,
	label: spaceTypeLabels[value],
}))

type FormData = z.infer<typeof schema>

export interface SpaceStepFormProps {
	accountId: string
}

export function SpaceStepForm({ accountId }: SpaceStepFormProps) {
	const [isPending, startTransition] = useTransition()

	const formId = useId()
	const router = useRouter()

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			spaceName: '',
			spaceDescription: '',
			spaceType: 'INDIVIDUAL',
		},
	})

	const onSubmit = async (formData: FormData) => {
		try {
			const result = await createSpaceAction({
				accountId,
				name: formData.spaceName,
				type: formData.spaceType ?? 'INDIVIDUAL',
				description: formData.spaceDescription,
			})

			toast.success(
				'Seu Space foi criado com sucesso. Você será redirecionado!',
			)

			new Promise((resolve) => setTimeout(resolve, 500))

			startTransition(() => {
				router.push(`/space/${result.spaceId}`)
			})
		} catch (error) {
			toast.error('Falha ao criar o Space. Por favor, tente novamente.')
			console.error('Failed to create space:', error)
		}
	}

	return (
		<>
			<Card>
				<CardHeader>
					<StepperHeader
						title="Space"
						description="Escolha o nome do seu space"
					/>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
							<FieldGroup>
								<Controller
									control={form.control}
									name="spaceName"
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FormLabel htmlFor={field.name}>
												Nome<span className="text-red-400">*</span>
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
									name="spaceType"
									render={({ field, fieldState }) => (
										<Field>
											<FormLabel htmlFor={field.name}>Tipo</FormLabel>
											<FormControl>
												<Select
													value={field.value}
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
													value={field.value}
													rows={3}
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
						type="submit"
						form={formId}
						disabled={form.formState.isSubmitting || isPending}
						preventDefault
					/>
				</div>
			</StepperFooter>
		</>
	)
}
