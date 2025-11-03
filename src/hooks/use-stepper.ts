import { StepperContent } from '@components/ui/stepper'
import { useContext } from 'react'

export function useStepper() {
	return useContext(StepperContent)
}
