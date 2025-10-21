'use client'

import { Button } from '@components/ui/button'
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@components/ui/drawer'
import { useIsMobile } from '@hooks/use-mobile'
import type { Process } from '@infra/db/schemas/processes'
import { useEffect, useState } from 'react'
import { DetailsView } from './details-view'
import { EditView } from './edit-view'

interface DrawerViewProps {
	process: Process | null
	isOpen: boolean
	onClose: () => void
}

type ViewMode = 'details' | 'edit'

export function DrawerView({ process, isOpen, onClose }: DrawerViewProps) {
	const [viewMode, setViewMode] = useState<ViewMode>('details')
	const isMobile = useIsMobile()

	useEffect(() => {
		if (isOpen) {
			setViewMode('details')
		}
	}, [isOpen])

	const handleEditClick = () => {
		setViewMode('edit')
	}

	const handleCancelEdit = () => {
		setViewMode('details')
	}

	const handleEditSuccess = () => {
		setViewMode('details')
		if (isMobile) {
			setTimeout(() => onClose(), 1000)
		}
	}

	if (!process) return null

	return (
		<Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DrawerContent className="max-h-[85vh]">
				<div
					className={`mx-auto w-full ${isMobile ? 'max-w-sm' : 'max-w-2xl'}`}
				>
					<DrawerHeader className="text-left">
						<DrawerTitle className="text-xl">
							{viewMode === 'details'
								? 'Detalhes do Processo'
								: 'Editar Processo'}
						</DrawerTitle>
						<DrawerDescription>
							{viewMode === 'details'
								? 'Visualize as informações completas do processo'
								: 'Atualize as informações do processo'}
						</DrawerDescription>
					</DrawerHeader>
					<div className="max-h-[60vh] overflow-y-auto px-4 pb-0">
						{viewMode === 'details' ? (
							<DetailsView process={process} />
						) : (
							<EditView
								process={process}
								onCancel={handleCancelEdit}
								onSuccess={handleEditSuccess}
							/>
						)}
					</div>
					<DrawerFooter className="pt-4">
						{viewMode === 'details' ? (
							<div
								className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}
							>
								<Button onClick={handleEditClick} className="flex-1">
									Editar Processo
								</Button>
								<DrawerClose asChild>
									<Button variant="outline" className="flex-1">
										Fechar
									</Button>
								</DrawerClose>
							</div>
						) : (
							<DrawerClose asChild>
								<Button variant="outline" className="w-full">
									Fechar
								</Button>
							</DrawerClose>
						)}
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
