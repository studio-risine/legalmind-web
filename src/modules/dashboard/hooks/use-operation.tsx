import { useContext } from 'react'
import { OperationContext } from '../components/operation-context'

export function useOperation() {
	const context = useContext(OperationContext)

	if (!context)
		throw new Error('useOperation must be used within OperationProvider')
	return context
}
