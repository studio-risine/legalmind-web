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
import { SubmitButton } from '@modules/auth/components/submit-button'
import { useOperation } from '@modules/dashboard/hooks/use-operation'
import type { ProcessInsertInput } from '@modules/process/actions/insert-process-action'
import { useCallback, useId, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { ProcessForm, type ProcessFormValues } from '../forms/process-form'
import { useProcessMutation } from '../hooks/use-process-mutations'

export function CreateProcessDialog() {
	const formId = useId()
	const { onCloseOperation, onConfirmOperation, isOpen } = useOperation()
	const [isClosing, startCloseOperation] = useTransition()
	const [isConfirming, startConfirmOperation] = useTransition()

	const { insertProcessAsync } = useProcessMutation()

	const formSchema = z.object({
		title: z
			.string()
			.min(2, {
				message: 'O título deve ter no mínimo 2 caracteres.',
			})
			.max(160)
			.trim(),
		cnj: z.string().max(32).optional().nullable(),
		court: z.string().max(120).optional().nullable(),
		clientId: z.string().optional().nullable(),
		status: z.string().optional().nullable(),
	}) satisfies z.ZodType<ProcessFormValues>

	const form = useForm<ProcessFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			cnj: null,
			court: null,
			clientId: null,
			status: 'active',
		},
		reValidateMode: 'onChange',
		mode: 'onSubmit',
	})

	const handleFormSubmit = useCallback(
		async (data: ProcessFormValues) => {
			try {
				const payload: ProcessInsertInput = {
					title: data.title,
					cnj: data.cnj || null,
					court: data.court || null,
					client_id: data.clientId || null,
					tags: [],
				}
				await insertProcessAsync(payload)
				toast.success('Processo criado com sucesso!')
				form.reset()
				onConfirmOperation()
			} catch (error) {
				console.error('Erro ao criar processo:', error)
				// Set form error for user feedback
				form.setError('root', {
					message:
						error instanceof Error
							? error.message
							: 'Erro inesperado ao criar processo. Tente novamente.',
				})
			}
		},
		[insertProcessAsync, form, onConfirmOperation],
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
					<DialogTitle>Criar processo</DialogTitle>
					<DialogDescription>
						Preencha os dados para criar um novo processo.
					</DialogDescription>
				</DialogHeader>

				<ProcessForm form={form} formId={formId} />

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
