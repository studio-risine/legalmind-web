// 'use client'

// import { Button } from '@/components/ui/button'
// import {
// 	Drawer,
// 	DrawerClose,
// 	DrawerContent,
// 	DrawerDescription,
// 	DrawerFooter,
// 	DrawerHeader,
// 	DrawerTitle,
// 	DrawerTrigger,
// } from '@/components/ui/drawer'
// import { Separator } from '@/components/ui/separator'
// import { useIsMobile } from '@/hooks/use-mobile'
// import type { Customer } from '../types'
// import { CustomerStatusBadge } from './status-badge'

// interface CustomerDetailsViewProps {
// 	customer: Customer
// 	children: ReactNode
// 	onEdit?: (customer: Customer) => void
// 	onDelete?: (customer: Customer) => void
// }

// export function CustomerDetailsView({
// 	customer,
// 	children,
// 	onEdit,
// 	onDelete,
// }: CustomerDetailsViewProps) {
// 	const isMobile = useIsMobile()

// 	if (!isMobile) {
// 		return <>{children}</>
// 	}

// 	return (
// 		<Drawer direction="right">
// 			<DrawerTrigger asChild>{children}</DrawerTrigger>
// 			<DrawerContent>
// 				<div className="mx-auto w-full max-w-sm">
// 					<DrawerHeader>
// 						<DrawerTitle>Detalhes do Cliente</DrawerTitle>
// 						<DrawerDescription>
// 							Visualize as informações completas do cliente
// 						</DrawerDescription>
// 					</DrawerHeader>
// 					<div className="p-4 pb-0">
// 						<div className="space-y-4">
// 							<div className="space-y-2">
// 								<h3 className="font-semibold text-lg">{customer.name}</h3>
// 								<CustomerStatusBadge status={customer.status} />
// 							</div>

// 							<Separator />

// 							<div className="space-y-3">
// 								{customer.email && (
// 									<div>
// 										<h4 className="font-medium text-sm">Email</h4>
// 										<p className="text-muted-foreground text-sm">
// 											{customer.email}
// 										</p>
// 									</div>
// 								)}

// 								{customer.phone && (
// 									<div>
// 										<h4 className="font-medium text-sm">Telefone</h4>
// 										<p className="text-muted-foreground text-sm">
// 											{customer.phone}
// 										</p>
// 									</div>
// 								)}

// 								{customer.document && (
// 									<div>
// 										<h4 className="font-medium text-sm">Documento</h4>
// 										<p className="text-muted-foreground text-sm">
// 											{customer.document}
// 										</p>
// 									</div>
// 								)}

// 								<div>
// 									<h4 className="font-medium text-sm">Data de Criação</h4>
// 									<p className="text-muted-foreground text-sm">
// 										{new Date(customer.createdAt).toLocaleDateString('pt-BR')}
// 									</p>
// 								</div>

// 								{customer.notes && (
// 									<div>
// 										<h4 className="font-medium text-sm">Observações</h4>
// 										<p className="text-muted-foreground text-sm">
// 											{customer.notes}
// 										</p>
// 									</div>
// 								)}
// 							</div>
// 						</div>
// 					</div>
// 					<DrawerFooter>
// 						<div className="flex gap-2">
// 							<Button
// 								variant="outline"
// 								className="flex-1"
// 								onClick={() => onEdit?.(customer)}
// 							>
// 								Editar
// 							</Button>
// 							<Button
// 								variant="destructive"
// 								className="flex-1"
// 								onClick={() => onDelete?.(customer)}
// 							>
// 								Excluir
// 							</Button>
// 						</div>
// 						<DrawerClose asChild>
// 							<Button variant="outline">Fechar</Button>
// 						</DrawerClose>
// 					</DrawerFooter>
// 				</div>
// 			</DrawerContent>
// 		</Drawer>
// 	)
// }
