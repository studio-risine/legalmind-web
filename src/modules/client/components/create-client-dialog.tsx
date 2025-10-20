'use client'

import { Button } from '@components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@components/ui/dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { email, phone } from '@libs/zod/inputs'
import { SubmitButton } from '@modules/auth/components/submit-button'
// Use server action input type to avoid requiring account_id on client
import type { ClientInsertInput } from '@modules/client/actions/insert-client-action'
import { useOperation } from '@modules/dashboard/hooks/use-operation'
import { useCallback, useId, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { ClientForm, type ClientFormValues } from '../forms/client-form'
import { useClientMutation } from '../hooks/use-client-mutations'

export function CreateClientDialog() {
	const formId = useId()
	const { onCloseOperation, onConfirmOperation, isOpen } = useOperation()
	const [isClosing, startCloseOperation] = useTransition()
	const [isConfirming, startConfirmOperation] = useTransition()

	const { createClientAsync } = useClientMutation()

	const formSchema = z.object({
		name: z
			.string()
			.min(2, {
				message: 'O nome deve ter no mínimo 2 caracteres.',
			})
			.max(100)
			.trim(),
		email: email.optional().nullable(),
		phone: phone.optional().nullable(),
		document: z.string().max(20).optional().nullable(),
	})

	const form = useForm<ClientFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			email: null,
			phone: null,
			document: null,
		},
		reValidateMode: 'onChange',
		mode: 'onSubmit',
	})

	const handleFormSubmit = useCallback(
		async (data: ClientFormValues) => {
			try {
				const payload: ClientInsertInput = {
					name: data.name ?? '',
					email: data.email ?? null,
					phone: data.phone ?? null,
					// Map UI "document" field to DB "tax_id"
					tax_id: data.document ?? null,
				}
				await createClientAsync(payload)
				form.reset()
				onConfirmOperation()
			} catch (error) {
				console.error('Erro ao criar cliente:', error)
			}
		},
		[createClientAsync, form, onConfirmOperation],
	)

	const handleSubmit = useCallback(() => {
		startConfirmOperation(() => {
			form.handleSubmit(handleFormSubmit)()
		})
	}, [form, handleFormSubmit])

	const handleClose = useCallback(() => {
		startCloseOperation(() => {
			form.reset()
			onCloseOperation()
		})
	}, [onCloseOperation, form])

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onCloseOperation()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Criar cliente</DialogTitle>
					<DialogDescription>
						Preencha os dados para criar um novo cliente.
					</DialogDescription>
				</DialogHeader>

				<ClientForm form={form} formId={formId} />

				<DialogFooter>
					<Button
						className="grow"
						variant="ghost"
						onClick={handleClose}
						disabled={isClosing || isConfirming}
					>
						Cancel
					</Button>
					<SubmitButton
						className="grow"
						form={formId}
						isLoading={isConfirming}
						text="Criar"
						textLoading="Criando..."
						onClick={handleSubmit}
						disabled={!form.formState.isValid || form.formState.isSubmitting}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
