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
import { InsertProcessForm } from '../forms'

export function ProcessDialog() {
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
				<Button size="sm">Novo Processo</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Novo Processo</DialogTitle>
					<DialogDescription>
						Preencha os dados para criar um novo processo.
					</DialogDescription>
				</DialogHeader>

				<InsertProcessForm formId={formId} onSuccess={handleSuccess} />

				<DialogFooter>
					<DialogClose asChild className="grow">
						<Button disabled={isPending} variant="ghost">
							Cancelar
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
