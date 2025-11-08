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
		<Dialog open={open} onOpenChange={setOpen}>
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
					<DialogClose className="grow" asChild>
						<Button variant="ghost" disabled={isPending}>
							Cancelar
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
