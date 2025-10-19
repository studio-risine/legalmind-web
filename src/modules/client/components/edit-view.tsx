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
// import { EditCustomerForm } from '../forms'
// import type { Customer } from '../types'

// interface EditCustomerViewProps {
// 	customer: Customer
// 	children: ReactNode
// }

// export function EditCustomerView({
// 	customer,
// 	children,
// }: EditCustomerViewProps) {
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
// 						<DrawerTitle>Editar Cliente</DrawerTitle>
// 						<DrawerDescription>
// 							Atualize as informações do cliente
// 						</DrawerDescription>
// 					</DrawerHeader>
// 					<div className="p-4 pb-0">
// 						<EditCustomerForm customer={customer} />
// 					</div>
// 					<DrawerFooter>
// 						<DrawerClose asChild>
// 							<Button variant="outline">Cancelar</Button>
// 						</DrawerClose>
// 					</DrawerFooter>
// 				</div>
// 			</DrawerContent>
// 		</Drawer>
// 	)
// }

