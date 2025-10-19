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
// import { useIsMobile } from '@/hooks/use-mobile'
// import type { Customer } from '../types'

// interface CustomerDrawerProps {
// 	customer?: Customer
// 	children: ReactNode
// 	onEdit?: (customer: Customer) => void
// 	onDelete?: (customer: Customer) => void
// }

// export function CustomerDrawer({
// 	customer,
// 	children,
// 	onEdit,
// 	onDelete,
// }: CustomerDrawerProps) {
// 	const isMobile = useIsMobile()

// 	if (!isMobile) {
// 		// For desktop, we might want to use a dialog instead
// 		// This is a placeholder for now
// 		return <>{children}</>
// 	}

// 	return (
// 		<Drawer>
// 			<DrawerTrigger asChild>{children}</DrawerTrigger>
// 			<DrawerContent>
// 				<div className="mx-auto w-full max-w-sm">
// 					<DrawerHeader>
// 						<DrawerTitle>
// 							{customer ? 'Detalhes do Cliente' : 'Novo Cliente'}
// 						</DrawerTitle>
// 						<DrawerDescription>
// 							{customer
// 								? 'Visualize e gerencie as informações do cliente'
// 								: 'Adicione um novo cliente ao sistema'}
// 						</DrawerDescription>
// 					</DrawerHeader>
// 					<div className="p-4 pb-0">
// 						{customer ? (
// 							<div className="space-y-4">
// 								<div>
// 									<h3 className="font-semibold">{customer.name}</h3>
// 									<p className="text-muted-foreground text-sm">
// 										{customer.email || 'Sem email'}
// 									</p>
// 									<p className="text-muted-foreground text-sm">
// 										{customer.phone || 'Sem telefone'}
// 									</p>
// 								</div>
// 								{customer.notes && (
// 									<div>
// 										<h4 className="font-medium">Observações</h4>
// 										<p className="text-muted-foreground text-sm">
// 											{customer.notes}
// 										</p>
// 									</div>
// 								)}
// 							</div>
// 						) : (
// 							<div className="text-center text-muted-foreground">
// 								Formulário de criação será implementado aqui
// 							</div>
// 						)}
// 					</div>
// 					<DrawerFooter>
// 						{customer && (
// 							<>
// 								<Button onClick={() => onEdit?.(customer)}>
// 									Editar Cliente
// 								</Button>
// 								<Button
// 									variant="destructive"
// 									onClick={() => onDelete?.(customer)}
// 								>
// 									Excluir Cliente
// 								</Button>
// 							</>
// 						)}
// 						<DrawerClose asChild>
// 							<Button variant="outline">Fechar</Button>
// 						</DrawerClose>
// 					</DrawerFooter>
// 				</div>
// 			</DrawerContent>
// 		</Drawer>
// 	)
// }
