'use client'

import { Button } from '@components/ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@components/ui/dialog'
import { SubmitButton } from '@modules/auth/components/submit-button'
import { useCallback, useId, useState, useTransition } from 'react'
import { InsertClientForm } from '../forms'

interface ClientDialogProps {
	spaceId: string
}

export function ClientDialog({ spaceId }: ClientDialogProps) {
	const formId = useId()
	const [isPending, startTransition] = useTransition()
	const [open, setOpen] = useState(false)

	const handleSuccess = useCallback(() => {
		startTransition(() => {
			setOpen(false)
		})
	}, [startTransition])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">Novo Cliente</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Novo Cliente</DialogTitle>
					<DialogDescription>
						Preencha os dados para criar um novo cliente.
					</DialogDescription>
				</DialogHeader>

				<InsertClientForm
					spaceId={spaceId}
					formId={formId}
					onSuccess={handleSuccess}
				/>

				<DialogFooter>
					<DialogClose className="grow" asChild>
						<Button variant="ghost" disabled={isPending}>
							Cancel
						</Button>
					</DialogClose>
					<SubmitButton
						className="grow"
						isLoading={isPending}
						disabled={isPending}
						text="Criar"
						textLoading="Criando..."
						form={formId}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
