'use client'

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@components/ui/dialog'
import { useState } from 'react'
// import { CreateClientDialog } from '@modules/client/components'
import { useOperation } from '../hooks/use-operation'

// const handler: Record<
// 	EntityType,
// 	Record<OperationType, () => ReactNode | null>
// > = {
// 	client: {
// 		create: () => <CreateClientDialog />,
// 		edit: () => null,
// 	},
// }

export function OperationHost() {
	const { current, isOpen, onCloseOperation, onOpenOperation } = useOperation()

	const [isDeleting, setIsDeleting] = useState(false)

	if (!current) return null

	if (current.operation === 'delete') {
		const handleConfirm = async () => {
			if (!current.onConfirm) return
			setIsDeleting(true)
			try {
				await current.onConfirm()
				onCloseOperation()
			} catch (error) {
				console.error('Failed to execute delete operation:', error)
			} finally {
				setIsDeleting(false)
			}
		}

		const handleCalcel = () => {
			onCloseOperation()
		}

		return (
			<Dialog
				open={isOpen}
				onOpenChange={(open) => !open && onCloseOperation()}
			>
				<form>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Delete confirmation</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete? This action cannot be undone.
								done.
							</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<DialogClose onClick={handleCalcel} asChild>
								Cancel
							</DialogClose>
							{/* <ButtonSubmit
								text="Delete"
								onClick={handleConfirm}
								textLoading="Deleting..."
								isLoading={isDeleting}
								variant="destructive"
							/> */}
						</DialogFooter>
					</DialogContent>
				</form>
			</Dialog>
		)
	}

	return null
}
