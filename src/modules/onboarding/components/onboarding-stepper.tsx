'use client'

import { Button } from '@components/ui/button'
// Import form field components
import { Field, FieldError, FieldGroup } from '@components/ui/field'
import { Form, FormControl, FormLabel } from '@components/ui/form'
import { Input } from '@components/ui/input'
import { MainContent } from '@components/ui/main-content'
import { PhoneInput } from '@components/ui/phone-input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@components/ui/select'
import {
	Stepper,
	StepperContent,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperList,
	StepperNextTrigger,
	StepperPrevTrigger,
	type StepperProps,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from '@components/ui/stepper'
import { Textarea } from '@components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { spaceTypeEnum } from '@infra/db/schemas'
import { updateAccountAction } from '@modules/account/actions/update-account-action'
import { insertSpaceAction } from '@modules/space/actions/insert-space-action'
import { createSelectSchema } from 'drizzle-zod'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { CompleteStep } from './complete-step'

// Unified schema for the entire onboarding flow
const onboardingSchema = z.object({
	// Account fields
	displayName: z.string().min(1, 'Nome é obrigatório').nullable().optional(),
	email: z.email('Email inválido').nullable().optional(),
	phoneNumber: z.string().nullable().optional(),
	oabNumber: z.string().nullable().optional(),
	oabState: z.string().nullable().optional(),
	// Space fields
	spaceName: z.string().min(1, 'Nome do Escritório é obrigatório'),
	spaceType: createSelectSchema(spaceTypeEnum).optional(),
	spaceDescription: z.string().optional(),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

// OAB States for the dropdown
const OAB_STATES = [
	'AC',
	'AL',
	'AP',
	'AM',
	'BA',
	'CE',
	'DF',
	'ES',
	'GO',
	'MA',
	'MT',
	'MS',
	'MG',
	'PA',
	'PB',
	'PR',
	'PE',
	'PI',
	'RJ',
	'RN',
	'RS',
	'RO',
	'RR',
	'SC',
	'SP',
	'SE',
	'TO',
]

// Space type labels
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

const steps = [
	{
		value: 'account',
		title: 'Conta',
		description: 'Configure suas informações profissionais',
		fields: [
			'displayName',
			'email',
			'phoneNumber',
			'oabNumber',
			'oabState',
		] as const,
	},
	{
		value: 'space',
		title: 'Espaço de Trabalho',
		description: 'Crie seu espaço de trabalho',
		fields: ['spaceName', 'spaceType', 'spaceDescription'] as const,
	},
	{
		value: 'complete',
		title: 'Finalizar',
		description: 'Complete a configuração inicial',
		fields: [] as const,
	},
]

interface OnboardingStepperProps {
	userId: string
	initialAccountData?: Partial<OnboardingFormValues>
}

export default function OnboardingStepper({
	userId,
	initialAccountData,
}: OnboardingStepperProps) {
	const [currentStep, setCurrentStep] = useState('account')
	const [isPending, startTransition] = useTransition()
	const [createdSpace, setCreatedSpace] = useState<{
		id: string
		name: string
	} | null>(null)

	const form = useForm<OnboardingFormValues>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			...initialAccountData,
			spaceType: 'INDIVIDUAL',
		},
	})

	const currentIndex = useMemo(
		() => steps.findIndex((step) => step.value === currentStep),
		[currentStep],
	)

	const onValueChange = useCallback((value: string) => {
		setCurrentStep(value)
	}, [])

	const handleAccountSubmit = useCallback(async (): Promise<boolean> => {
		const formData = form.getValues()

		return new Promise((resolve) => {
			startTransition(async () => {
				try {
					const result = await updateAccountAction({
						id: userId,
						displayName: formData.displayName,
						email: formData.email,
						phoneNumber: formData.phoneNumber,
						oabNumber: formData.oabNumber,
						oabState: formData.oabState,
					})

					if (result.success) {
						toast.success('Informações da conta atualizadas!')
						resolve(true)
					} else {
						toast.error(result.error || 'Erro ao atualizar conta')
						resolve(false)
					}
				} catch (error) {
					toast.error('Erro inesperado ao atualizar conta')
					console.error(error)
					resolve(false)
				}
			})
		})
	}, [userId, form])

	const handleSpaceSubmit = useCallback(async (): Promise<boolean> => {
		const formData = form.getValues()

		return new Promise((resolve) => {
			startTransition(async () => {
				try {
					const result = await insertSpaceAction({
						name: formData.spaceName,
						type: formData.spaceType || 'INDIVIDUAL',
						createdBy: userId,
					})

					if (result.success && result.data) {
						toast.success('Space criado com sucesso!')
						setCreatedSpace({
							id: result.data.id,
							name: result.data.name || 'Meu Space',
						})
						resolve(true)
					} else {
						toast.error(result.error || 'Erro ao criar Space')
						resolve(false)
					}
				} catch (error) {
					toast.error('Erro inesperado ao criar Space')
					console.error(error)
					resolve(false)
				}
			})
		})
	}, [userId, form])

	const onValidate: NonNullable<StepperProps['onValidate']> = useCallback(
		async (_value, direction) => {
			if (direction === 'prev') return true

			const currentStepData = steps.find((s) => s.value === currentStep)
			if (!currentStepData) return true

			// First validate the fields
			const isValid = await form.trigger(currentStepData.fields)

			if (!isValid) {
				toast.info(
					'Por favor, complete todos os campos obrigatórios para continuar',
					{
						description: 'Corrija os erros de validação e tente novamente.',
					},
				)
				return false
			}

			// If validation passes, execute the corresponding action
			if (currentStep === 'account') {
				const success = await handleAccountSubmit()
				return success
			}

			if (currentStep === 'space') {
				const success = await handleSpaceSubmit()
				return success
			}

			return true
		},
		[form, currentStep, handleAccountSubmit, handleSpaceSubmit],
	)

	return (
		<MainContent size="lg">
			<Stepper
				value={currentStep}
				onValueChange={onValueChange}
				onValidate={onValidate}
				className="h-full w-full max-w-2xl"
			>
				<StepperList>
					{steps.map((step) => (
						<StepperItem key={step.value} value={step.value}>
							<StepperTrigger>
								<StepperIndicator />
								<div className="flex flex-col gap-1">
									<StepperTitle>{step.title}</StepperTitle>
									<StepperDescription>{step.description}</StepperDescription>
								</div>
							</StepperTrigger>
							<StepperSeparator />
						</StepperItem>
					))}
				</StepperList>
				<StepperContent
					value="account"
					className="flex flex-col items-center gap-4 rounded-md border bg-card p-6 text-card-foreground"
				>
					<div className="flex flex-col items-center gap-px text-center">
						<h3 className="font-semibold text-lg">Informações da Conta</h3>
						<p className="text-muted-foreground">
							Configure suas informações profissionais
						</p>
					</div>

					<div className="w-full max-w-md">
						<Form {...form}>
							<form className="grid gap-4">
								<FieldGroup>
									<Controller
										control={form.control}
										name="displayName"
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FormLabel htmlFor={field.name}>
													Nome de exibição{' '}
													<span className="text-red-400">*</span>
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														id={field.name}
														placeholder="Seu nome completo"
														data-invalid={fieldState.invalid}
														value={field.value || ''}
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
														placeholder="seu.email@exemplo.com"
														data-invalid={fieldState.invalid}
														value={field.value || ''}
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
														placeholder="(11) 99999-9999"
														value={field.value || ''}
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
															placeholder="123456"
															value={field.value || ''}
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
					</div>
				</StepperContent>{' '}
				<StepperContent
					value="space"
					className="flex flex-col items-center gap-4 rounded-md border bg-card p-6 text-card-foreground"
				>
					<div className="flex flex-col items-center gap-px text-center">
						<h3 className="font-semibold text-lg">Criar Workspace</h3>
						<p className="text-muted-foreground">
							Configure seu ambiente de trabalho
						</p>
					</div>

					<div className="w-full max-w-md">
						<Form {...form}>
							<form className="grid gap-4">
								<FieldGroup>
									<Controller
										control={form.control}
										name="spaceName"
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FormLabel htmlFor={field.name}>
													Nome do workspace{' '}
													<span className="text-red-400">*</span>
												</FormLabel>
												<FormControl>
													<Input
														{...field}
														id={field.name}
														placeholder="Meu Escritório"
														data-invalid={fieldState.invalid}
														value={field.value || ''}
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
												<FormLabel htmlFor={field.name}>
													Tipo de workspace
												</FormLabel>
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
												<FormLabel htmlFor={field.name}>
													Descrição (opcional)
												</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														id={field.name}
														placeholder="Descreva seu workspace..."
														value={field.value || ''}
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
					</div>
				</StepperContent>
				<StepperContent
					value="complete"
					className="flex flex-col items-center gap-4 rounded-md border bg-card p-6 text-card-foreground"
				>
					{createdSpace && (
						<CompleteStep
							spaceId={createdSpace.id}
							spaceName={createdSpace.name}
						/>
					)}
				</StepperContent>
				<div className="mt-4 flex justify-between">
					<StepperPrevTrigger asChild>
						<Button type="button" variant="outline" disabled={isPending}>
							Anterior
						</Button>
					</StepperPrevTrigger>
					<div className="text-muted-foreground text-sm">
						Etapa {currentIndex + 1} de {steps.length}
					</div>
					{currentIndex === steps.length - 1 ? (
						<Button type="button" disabled>
							Concluído
						</Button>
					) : (
						<StepperNextTrigger asChild>
							<Button type="button" disabled={isPending}>
								{isPending ? 'Processando...' : 'Continuar'}
							</Button>
						</StepperNextTrigger>
					)}
				</div>
			</Stepper>
		</MainContent>
	)
}
