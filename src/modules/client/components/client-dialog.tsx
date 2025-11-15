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
		<Dialog onOpenChange={setOpen} open={open}>
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
					formId={formId}
					onSuccess={handleSuccess}
					spaceId={spaceId}
				/>

				<DialogFooter>
					<DialogClose asChild className="grow">
						<Button disabled={isPending} variant="ghost">
							Cancel
						</Button>
					</DialogClose>
					<SubmitButton
						className="grow"
						disabled={isPending}
						form={formId}
						isLoading={isPending}
						text="Criar"
						textLoading="Criando..."
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
