'use client'

import { DataTable } from '@components/data-table/data-table'
import { DataTableActionBar } from '@components/data-table/data-table-action-bar'
import { DataTableActions } from '@components/data-table/data-table-actions'
import { DataTableColumnHeader } from '@components/data-table/data-table-column-header'
import { DataTableToolbar } from '@components/data-table/data-table-toolbar'
import { TableCellPrimary } from '@components/table'
import { TableCellText, TableCellTextEmpty } from '@components/table/table-cell-text'
import { Checkbox } from '@components/ui/checkbox'
import { useDataTable } from '@hooks/use-data-table'
import type { ProcessStatus } from '@infra/db/schemas'
import type { Column, ColumnDef } from '@tanstack/react-table'
import { maskProcessNumber } from '@utils/formatters'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { deleteProcessAction } from '../actions'
import { ProcessDialog } from './process-dialog'
import { ProcessStatusBadge } from './status-badge'

export interface DataTableRows {
	id: string
	title: string
	processNumber: string
	status: ProcessStatus
	client?: {
		id: string
		name: string
	}
}

interface DataTableProcessProps {
	rows: DataTableRows[]
	total: number
}

export function DataTableProcess({ rows, total }: DataTableProcessProps) {
	const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(25))
	const pageCount = Math.max(1, Math.ceil(total / perPage))

	const columns = useMemo<ColumnDef<DataTableRows>[]>(
		() => [
			{
				cell: ({ row }) => (
					<Checkbox
						aria-label="Select row"
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
					/>
				),
				enableColumnFilter: false,
				enableSorting: false,
				header: ({ table }) => (
					<Checkbox
						aria-label="Select all"
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && 'indeterminate')
						}
						onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					/>
				),
				id: 'select',
				meta: {
					label: '#',
				},
				size: 32,
			},
			{
				accessorFn: (row) => row.title,
				cell: ({ row }) => (
					<TableCellPrimary link={`processo/${row.original.id}`} title={row.original.title} />
				),
				enableColumnFilter: true,
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Título" />
				),
				id: 'search',
				meta: {
					label: 'Título',
					placeholder: 'Pesquisar...',
					variant: 'text',
				},
				minSize: 240,
			},
			{
				accessorFn: (row) => row.processNumber,
				cell: ({ row }) => (
					<TableCellText>{maskProcessNumber(row.original.processNumber)}</TableCellText>
				),
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Processo" />
				),
				id: 'processNumber',
				meta: {
					label: 'Número',
				},
				minSize: 220,
			},
			{
				accessorFn: (row) => row.client?.name ?? '',
				cell: ({ row }) =>
					row.original.client ? (
						<TableCellText>{row.original.client.name}</TableCellText>
					) : (
						<TableCellTextEmpty />
					),
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Autor" />
				),
				id: 'client',
				meta: {
					label: 'Cliente',
				},
				minSize: 200,
			},
			{
				accessorFn: (row) => row.client?.name ?? '',
				cell: ({ row }) =>
					row.original.client ? (
						<TableCellText>{row.original.client.name}</TableCellText>
					) : (
						<TableCellTextEmpty />
					),
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Réu" />
				),
				id: 'client',
				meta: {
					label: 'Cliente',
				},
				minSize: 200,
			},
			{
				accessorFn: (row) => row.status,
				cell: ({ row }) => <ProcessStatusBadge status={row.original.status} />,
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				id: 'status',
				meta: {
					label: 'Status',
					variant: 'select',
				},
				minSize: 120,
			},
		],
		[],
	)

	const { table } = useDataTable({
		clearOnDefault: true,
		columns,
		data: rows,
		getRowId: (row) => row.id,
		pageCount,
		shallow: false,
	})

	const handleDelete = useCallback(async (id: string) => {
		const { success, error } = await deleteProcessAction({ id })

		if (success) {
			toast.success('Processo excluído com sucesso!')
		}

		if (!success || error) {
			toast.error('Erro ao excluir o processo', { description: error?.message })
		}
	}, [])

	return (
		<div className="data-table-container">
			<DataTable
				actionBar={
					<DataTableActionBar table={table}>
						<DataTableActions onDelete={handleDelete} table={table} />
					</DataTableActionBar>
				}
				table={table}
			>
				<DataTableToolbar table={table}>
					<ProcessDialog />
				</DataTableToolbar>
			</DataTable>
		</div>
	)
}
