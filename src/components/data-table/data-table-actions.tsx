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

function toCSV(rows: Record<string, unknown>[]): string {
	if (!rows.length) return ''
	const headers = Array.from(
		rows.reduce<Set<string>>((set, row) => {
			Object.keys(row).forEach((k) => set.add(k))
			return set
		}, new Set<string>()),
	)

	const escapeCsv = (val: unknown) => {
		if (val === null || val === undefined) return ''

		const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
		const needsQuotes = /[",\n]/.test(str)
		const escaped = str.replace(/"/g, '""')
		return needsQuotes ? `"${escaped}"` : escaped
	}

	const headerRow = headers.join(',')
	const dataRows = rows.map((row) =>
		headers.map((header) => escapeCsv(row[header])).join(','),
	)
	return [headerRow, ...dataRows].join('\n')
}

export function DataTableActions<TData>({
	table,
	onEdit,
	onDelete,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onDownload: _onDownload,
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
	const canDownload = selectedRows.length > 0

	const handleEdit = useCallback(() => {
		if (!canEdit || !onEdit) return
		// onEdit expects a single id and row
		onEdit(selectedIds[0], selectedRows[0])
	}, [canEdit, onEdit, selectedIds, selectedRows])

	const handleDelete = React.useCallback(async () => {
		if (!canDelete || !onDelete) return
		try {
			setIsDeleting(true)
			// Call onDelete for each selected row sequentially to respect the single-item API
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
				orientation="vertical"
				className="mr-1 ml-2 data-[orientation=vertical]:h-4"
			/>

			<Tooltip>
				<TooltipTrigger asChild>
					<DataTableActionBarAction
						onClick={handleEdit}
						disabled={!canEdit}
						tooltip={canEdit ? 'Edit selected' : 'Select exactly 1 row to edit'}
					>
						Edit
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
							onClick={handleDelete}
							disabled={!canDelete}
							isPending={isDeleting}
							className="text-red-600 hover:text-red-700"
							tooltip={canDelete ? 'Delete selected' : 'Select rows to delete'}
						>
							Delete
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
