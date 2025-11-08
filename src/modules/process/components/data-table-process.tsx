'use client'

import { DataTable } from '@components/data-table/data-table'
import { DataTableActionBar } from '@components/data-table/data-table-action-bar'
import { DataTableActions } from '@components/data-table/data-table-actions'
import { DataTableColumnHeader } from '@components/data-table/data-table-column-header'
import { DataTableToolbar } from '@components/data-table/data-table-toolbar'
import { TableCellPrimary } from '@components/table'
import {
	TableCellText,
	TableCellTextEmpty,
} from '@components/table/table-cell-text'
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
				id: 'select',
				header: ({ table }) => (
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && 'indeterminate')
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
					/>
				),
				cell: ({ row }) => (
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				),
				meta: {
					label: '#',
				},
				enableColumnFilter: false,
				enableSorting: false,
				size: 32,
			},
			{
				id: 'search',
				accessorFn: (row) => row.title,
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Título" />
				),
				cell: ({ row }) => (
					<TableCellPrimary
						title={row.original.title}
						link={`processo/${row.original.id}`}
					/>
				),
				meta: {
					label: 'Título',
					placeholder: 'Pesquisar...',
					variant: 'text',
				},
				enableColumnFilter: true,
				minSize: 240,
			},
			{
				id: 'processNumber',
				accessorFn: (row) => row.processNumber,
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Processo" />
				),
				cell: ({ row }) => (
					<TableCellText>
						{maskProcessNumber(row.original.processNumber)}
					</TableCellText>
				),
				meta: {
					label: 'Número',
				},
				minSize: 220,
			},
			{
				id: 'client',
				accessorFn: (row) => row.client?.name ?? '',
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Cliente" />
				),
				cell: ({ row }) =>
					row.original.client ? (
						<TableCellText>{row.original.client.name}</TableCellText>
					) : (
						<TableCellTextEmpty />
					),
				meta: {
					label: 'Cliente',
				},
				minSize: 200,
			},
			{
				id: 'status',
				accessorFn: (row) => row.status,
				header: ({ column }: { column: Column<DataTableRows, unknown> }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				cell: ({ row }) => <ProcessStatusBadge status={row.original.status} />,
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
		data: rows,
		columns,
		pageCount,
		getRowId: (row) => row.id,
		shallow: false,
		clearOnDefault: true,
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
				table={table}
				actionBar={
					<DataTableActionBar table={table}>
						<DataTableActions table={table} onDelete={handleDelete} />
					</DataTableActionBar>
				}
			>
				<DataTableToolbar table={table}>
					<ProcessDialog />
				</DataTableToolbar>
			</DataTable>
		</div>
	)
}
