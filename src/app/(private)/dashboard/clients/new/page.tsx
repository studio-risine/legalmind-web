'use client'

import { Button } from '@components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@components/ui/select'
import { Textarea } from '@components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useId, useState } from 'react'

export default function NewClientPage() {
	const nameId = useId()
	const documentTypeId = useId()
	const documentId = useId()
	const emailId = useId()
	const phoneId = useId()
	const notesId = useId()

	const [formData, setFormData] = useState({
		name: '',
		document: '',
		documentType: 'CPF',
		email: '',
		phone: '',
		notes: '',
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Creating client:', formData)
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/dashboard/clients">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Novo Cliente</h1>
					<p className="text-muted-foreground">
						Adicione um novo cliente ao sistema
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Informações do Cliente</CardTitle>
					<CardDescription>
						Preencha os dados básicos do cliente
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor={nameId}>Nome *</Label>
								<Input
									id={nameId}
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor={documentTypeId}>Tipo de Documento</Label>
								<Select
									value={formData.documentType}
									onValueChange={(value) =>
										setFormData({ ...formData, documentType: value })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="CPF">CPF</SelectItem>
										<SelectItem value="CNPJ">CNPJ</SelectItem>
										<SelectItem value="RG">RG</SelectItem>
										<SelectItem value="PASSPORT">Passaporte</SelectItem>
										<SelectItem value="OTHER">Outro</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor={documentId}>Documento</Label>
								<Input
									id={documentId}
									value={formData.document}
									onChange={(e) =>
										setFormData({ ...formData, document: e.target.value })
									}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor={emailId}>Email</Label>
								<Input
									id={emailId}
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor={phoneId}>Telefone</Label>
								<Input
									id={phoneId}
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor={notesId}>Observações</Label>
							<Textarea
								id={notesId}
								value={formData.notes}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
								rows={3}
							/>
						</div>

						<div className="flex gap-4">
							<Button type="submit">Salvar Cliente</Button>
							<Button variant="outline" asChild>
								<Link href="/dashboard/clients">Cancelar</Link>
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
