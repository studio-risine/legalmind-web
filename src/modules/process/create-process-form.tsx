'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useCreateProcess } from '@/hooks/useCreateProcess'

const createProcessSchema = z.object({
	title: z
		.string()
		.min(1, 'Título é obrigatório')
		.max(255, 'Título muito longo'),
	area: z.enum([
		'CIVIL',
		'LABOR',
		'CRIMINAL',
		'FAMILY',
		'TAX',
		'ADMINISTRATIVE',
		'CONSTITUTIONAL',
		'INTERNATIONAL',
	] as const),
	status: z
		.enum(['ONGOING', 'SUSPENDED', 'ARCHIVED', 'CLOSED'] as const)
		.optional(),
	accountId: z.string().min(1, 'Conta é obrigatória'),
})

export type CreateProcessFormData = z.infer<typeof createProcessSchema>

interface CreateProcessFormProps {
	onSuccess?: () => void
	onCancel?: () => void
}

export function CreateProcessForm({
	onSuccess,
	onCancel,
}: CreateProcessFormProps) {
	const { createProcess, isLoading } = useCreateProcess({
		onSuccess: () => {
			form.reset()
			onSuccess?.()
		},
	})
	const form = useForm<CreateProcessFormData>({
		resolver: zodResolver(createProcessSchema),
		defaultValues: {
			title: '',
			area: 'CIVIL' as const,
			status: 'ONGOING' as const,
			accountId: '',
		},
	})

	const handleSubmit = (data: CreateProcessFormData) => {
		createProcess({
			title: data.title,
			area: data.area,
			status: data.status,
			accountId: data.accountId,
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Título do Processo</FormLabel>
							<FormControl>
								<Input
									placeholder="Digite o título do processo"
									{...field}
									disabled={isLoading}
								/>
							</FormControl>
							<FormDescription>
								Nome identificador do processo jurídico
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="area"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Área do Direito</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selecione a área" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="CIVIL">Civil</SelectItem>
									<SelectItem value="LABOR">Trabalhista</SelectItem>
									<SelectItem value="CRIMINAL">Criminal</SelectItem>
									<SelectItem value="FAMILY">Família</SelectItem>
									<SelectItem value="TAX">Tributário</SelectItem>
									<SelectItem value="ADMINISTRATIVE">Administrativo</SelectItem>
									<SelectItem value="CONSTITUTIONAL">Constitucional</SelectItem>
									<SelectItem value="INTERNATIONAL">Internacional</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>
								Selecione a área jurídica do processo
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
								disabled={isLoading}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selecione o status" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="ONGOING">Em andamento</SelectItem>
									<SelectItem value="SUSPENDED">Suspenso</SelectItem>
									<SelectItem value="ARCHIVED">Arquivado</SelectItem>
									<SelectItem value="CLOSED">Encerrado</SelectItem>
								</SelectContent>
							</Select>
							<FormDescription>Status atual do processo</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end space-x-4">
					{onCancel && (
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isLoading}
						>
							Cancelar
						</Button>
					)}
					<Button type="submit" disabled={isLoading} className="min-w-[120px]">
						{isLoading ? 'Criando...' : 'Criar Processo'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
