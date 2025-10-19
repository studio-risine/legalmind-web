'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useState } from 'react'

export type EntityType = 'client' | 'process'
export type OperationType = 'open' | 'create' | 'edit' | 'delete'

export interface Operation {
	id?: string
	entity: EntityType
	operation: OperationType
	onConfirm?: () => Promise<void> | void
}

interface OperationContextValue {
	current: Operation | null
	isOpen: boolean
	onOpenOperation: (operation: Operation) => void
	onConfirmOperation: () => Promise<void>
	onCloseOperation: () => void
}

export const OperationContext = createContext<OperationContextValue | null>(
	null,
)

export function OperationProvider({ children }: { children: ReactNode }) {
	const [current, setCurrent] = useState<Operation | null>(null)
	const [isOpen, setIsOpen] = useState(false)

	const onOpenOperation = useCallback(
		(operation: Operation) => {
			setCurrent(operation)
			setIsOpen(true)
		},
		[isOpen],
	)

	const onCloseOperation = useCallback(() => {
		setCurrent(null)
		setIsOpen(false)
	}, [isOpen])

	const onConfirmOperation = useCallback(async () => {
		try {
			await current?.onConfirm?.()
		} finally {
			setCurrent(null)
			setIsOpen(false)
		}
	}, [current, isOpen])

	return (
		<OperationContext.Provider
			value={{
				current,
				isOpen,
				onOpenOperation,
				onConfirmOperation,
				onCloseOperation,
			}}
		>
			{children}
		</OperationContext.Provider>
	)
}
