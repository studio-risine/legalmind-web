'use client'
import { Separator } from '@components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ui/tooltip'
import type { Table } from '@tanstack/react-table'
import * as React from 'react'
import { useCallback, useState } from 'react'
import {
	DataTableActionBarAction,
	DataTableActionBarSelection,
} from './data-table-action-bar'

interface DataTableActionsProps<TData> {
	table: Table<TData>
	onEdit?: (id: string, row: TData) => void
	onDelete?: (id: string, row: TData) => void | Promise<void>
	onDownload?: (rows: TData[], format: 'csv' | 'json') => void
	getId?: (row: TData, fallbackId?: string) => string
}

export function DataTableActions<TData>({
	table,
	onEdit,
	onDelete,
	getId,
}: DataTableActionsProps<TData>) {
	const [isDeleting, setIsDeleting] = useState(false)

	const selected = table.getFilteredSelectedRowModel().rows
	const selectedRows = selected.map((r) => r.original)
	const selectedIds = selected.map((r) =>
		getId ? getId(r.original, r.id) : r.id,
	)

	const canEdit = selectedIds.length === 1 && !!onEdit
	const canDelete = selectedIds.length > 0 && !!onDelete

	const handleEdit = useCallback(() => {
		if (!canEdit || !onEdit) return
		onEdit(selectedIds[0], selectedRows[0])
	}, [canEdit, onEdit, selectedIds, selectedRows])

	const handleDelete = React.useCallback(async () => {
		if (!canDelete || !onDelete) return
		try {
			setIsDeleting(true)
			for (let i = 0; i < selectedIds.length; i++) {
				await onDelete(selectedIds[i], selectedRows[i])
			}
		} finally {
			setIsDeleting(false)
		}
	}, [canDelete, onDelete, selectedIds, selectedRows])

	return (
		<div className="flex items-center gap-2">
			<DataTableActionBarSelection table={table} />

			<Separator
				className="mr-1 ml-2 data-[orientation=vertical]:h-4"
				orientation="vertical"
			/>

			<Tooltip>
				<TooltipTrigger asChild>
					<DataTableActionBarAction
						disabled={!canEdit}
						onClick={handleEdit}
						tooltip={canEdit ? 'Edit selected' : 'Select exactly 1 row to edit'}
					>
						Editar
					</DataTableActionBarAction>
				</TooltipTrigger>
				<TooltipContent sideOffset={6}>
					<p>{canEdit ? 'Edit selected' : 'Select exactly 1 row to edit'}</p>
				</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger asChild>
					<span>
						<DataTableActionBarAction
							className="text-red-600 hover:text-red-700"
							disabled={!canDelete}
							isPending={isDeleting}
							onClick={handleDelete}
							tooltip={canDelete ? 'Delete selected' : 'Select rows to delete'}
						>
							Deletar
						</DataTableActionBarAction>
					</span>
				</TooltipTrigger>
				<TooltipContent sideOffset={6}>
					<p>{canDelete ? 'Delete selected' : 'Select rows to delete'}</p>
				</TooltipContent>
			</Tooltip>
		</div>
	)
}
