'use client'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Process } from '@infra/db/schemas/processes'
import type { ProcessUpdateInput } from '@modules/process/actions/update-process-action'
import { useCallback, useId } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { ProcessForm, type ProcessFormValues } from '../forms/process-form'
import { useProcessMutation } from '../hooks/use-process-mutations'

interface EditViewProps {
	process: Process
	onCancel?: () => void
	onSuccess?: () => void
}

export function EditView({ process, onCancel, onSuccess }: EditViewProps) {
	const formId = useId()
	const { updateProcessAsync } = useProcessMutation()

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
			title: process.title || '',
			cnj: process.cnj || null,
			court: process.court || null,
			clientId: process.client_id || null,
			status: process.status || null,
		},
		reValidateMode: 'onChange',
		mode: 'onSubmit',
	})

	const handleFormSubmit = useCallback(
		async (data: ProcessFormValues) => {
			try {
				const payload: ProcessUpdateInput = {
					id: process.id,
					title: data.title,
					cnj: data.cnj || null,
					court: data.court || null,
					client_id: data.clientId || null,
				}
				await updateProcessAsync(payload)
				toast.success('Processo atualizado com sucesso!')
				onSuccess?.()
			} catch (error) {
				console.error('Erro ao atualizar processo:', error)
				const errorMessage =
					error instanceof Error
						? error.message
						: 'Erro inesperado ao atualizar processo. Tente novamente.'
				toast.error(errorMessage)
				form.setError('root', { message: errorMessage })
			}
		},
		[updateProcessAsync, process.id, onSuccess],
	)

	const handleSubmit = useCallback(() => {
		form.handleSubmit(handleFormSubmit)()
	}, [form, handleFormSubmit])

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Editar Processo</CardTitle>
				</CardHeader>
				<CardContent>
					<ProcessForm form={form} formId={formId} />
					<div className="mt-6 flex gap-4">
						<Button
							onClick={handleSubmit}
							disabled={!form.formState.isValid || form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
						</Button>
						<Button
							variant="outline"
							onClick={onCancel}
							disabled={form.formState.isSubmitting}
						>
							Cancelar
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
