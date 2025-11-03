'use client'

import { cn } from '@libs/utils'
import {
	type ComponentPropsWithRef,
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from 'react'
import { Button } from './button'

interface StepperContentValue {
	previousStep: () => void
	nextStep: () => void
}

export const StepperContent = createContext({} as StepperContentValue)

export interface StepperProps {
	initialStep: number
	steps: {
		id: string
		title: string
		description: string
		content?: ReactNode
	}[]
}

export function Stepper({ steps, initialStep = 0 }: StepperProps) {
	const [currentStep, setCurrentStep] = useState(initialStep)

	const previousStep = useCallback(() => {
		setCurrentStep((prevState) => Math.max(prevState - 1, 0))
	}, [])

	const nextStep = useCallback(() => {
		setCurrentStep((prevState) => Math.min(steps.length - 1, prevState + 1))
	}, [steps])

	return (
		<StepperContent.Provider value={{ previousStep, nextStep }}>
			<section className="space-y-10">
				<div className="flex gap-20">
					{steps.map((step, index) => (
						<Button
							onClick={() => setCurrentStep(index)}
							className={cn(
								'flex gap-4 px-0 dark:hover:bg-transparent',
								index === currentStep ? 'text-primary' : '',
							)}
							variant="ghost"
							key={step.id}
						>
							<span
								className={cn(
									'h-9 w-9 rounded-full',
									index === currentStep
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground',
									'flex items-center justify-center font-mono',
								)}
							>
								{String(index + 1).padStart(2, '0')}
							</span>
							<div className="flex flex-col items-start" key={step.id}>
								<b className="font-semibold text-base/snug text-foreground">
									{step.title}{' '}
								</b>
								<p className="text-muted-foreground text-sm/snug">
									{step.description}
								</p>
							</div>
						</Button>
					))}
				</div>

				<div>{steps[currentStep].content}</div>
			</section>
		</StepperContent.Provider>
	)
}

export function StepperHeader({
	title,
	description,
}: {
	title: string
	description?: string
}) {
	return (
		<header>
			<h1 className="font-bold text-2xl text-foreground">{title}</h1>
			{description && (
				<span className="text-muted-foreground">{description}</span>
			)}
		</header>
	)
}

export function StepperFooter({ children }: { children: ReactNode }) {
	return <footer className="mt-4 flex justify-end gap-4">{children}</footer>
}

export function StepperPreviuesButton({
	type = 'button',
	preventDefault = false,
	...props
}: Omit<ComponentPropsWithRef<typeof Button>, 'onClick'> & {
	preventDefault?: boolean
}) {
	const { previousStep } = useContext(StepperContent)
	return (
		<Button
			variant="secondary"
			size="sm"
			onClick={!preventDefault ? previousStep : undefined}
			type={type}
			{...props}
		>
			Anterior
		</Button>
	)
}

export function StepperNextButton({
	type = 'button',
	preventDefault = false,
	...props
}: Omit<ComponentPropsWithRef<typeof Button>, 'onClick'> & {
	preventDefault?: boolean
}) {
	const { nextStep } = useContext(StepperContent)

	return (
		<Button
			size="sm"
			type={type}
			onClick={!preventDefault ? nextStep : undefined}
			{...props}
		>
			Próxima
		</Button>
	)
}
