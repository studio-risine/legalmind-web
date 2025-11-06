'use client'

import { DataTable } from '@components/data-table/data-table'
import { DataTableActionBar } from '@components/data-table/data-table-action-bar'
import { DataTableActions } from '@components/data-table/data-table-actions'
import { DataTableColumnHeader } from '@components/data-table/data-table-column-header'
import { DataTableToolbar } from '@components/data-table/data-table-toolbar'
import {
	TableCellText,
	TableCellTextEmpty,
} from '@components/table/table-cell-text'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { useDataTable } from '@hooks/use-data-table'
import type { Process } from '@infra/db/schemas'
import { RiExpandDiagonalLine, RiMoreFill } from '@remixicon/react'
import type { Column, ColumnDef } from '@tanstack/react-table'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useMemo } from 'react'

interface DataTableProcessesProps {
	data: Process[]
	total: number
}

const statusColors = {
	PENDING: 'bg-yellow-500/10 text-yellow-700',
	ACTIVE: 'bg-green-500/10 text-green-700',
	SUSPENDED: 'bg-orange-500/10 text-orange-700',
	ARCHIVED: 'bg-gray-500/10 text-gray-700',
	CLOSED: 'bg-blue-500/10 text-blue-700',
}

export function DataTableProcesses({ data, total }: DataTableProcessesProps) {
	const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(25))
	const pageCount = Math.max(1, Math.ceil(total / perPage))

	const columns = useMemo<ColumnDef<Process>[]>(
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
				id: 'processNumber',
				accessorFn: (row) => row.processNumber ?? '',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="Número do Processo" />
				),
				cell: ({ row }) => (
					<div className="group relative">
						<TableCellText>
							<span className="font-mono text-xs">
								{row.original.processNumber}
							</span>
						</TableCellText>
						<div className="-top-1 invisible absolute right-0 z-10 rounded duration-100 ease-in-out group-hover:visible">
							<Button size="sm" variant="secondary">
								<RiExpandDiagonalLine />
								Abrir
							</Button>
						</div>
					</div>
				),
				meta: {
					label: 'Número',
					placeholder: 'Buscar...',
					variant: 'text',
				},
				enableColumnFilter: true,
				minSize: 220,
			},
			{
				id: 'title',
				accessorFn: (row) => row.title ?? '',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="Título" />
				),
				cell: ({ row }) => <TableCellText>{row.original.title}</TableCellText>,
				meta: {
					label: 'Título',
					placeholder: 'Pesquisar...',
					variant: 'text',
				},
				enableColumnFilter: true,
				minSize: 240,
			},
			{
				id: 'status',
				accessorFn: (row) => row.status ?? '',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				cell: ({ row }) => (
					<Badge
						variant="outline"
						className={statusColors[row.original.status] || ''}
					>
						{row.original.status}
					</Badge>
				),
				meta: {
					label: 'Status',
					variant: 'select',
				},
			},
			{
				id: 'description',
				accessorFn: (row) => row.description ?? '',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="Descrição" />
				),
				cell: ({ row }) =>
					row.original.description ? (
						<div className="max-w-xs truncate">
							<TableCellText>{row.original.description}</TableCellText>
						</div>
					) : (
						<TableCellTextEmpty />
					),
				meta: {
					label: 'Descrição',
					variant: 'text',
				},
			},
			{
				id: 'action',
				cell: () => {
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<RiMoreFill />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem>Abrir</DropdownMenuItem>
								<DropdownMenuItem>Editar</DropdownMenuItem>
								<DropdownMenuItem>Excluir</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)
				},
				right: true,
				maxSize: 36,
			},
		],
		[],
	)

	const { table } = useDataTable({
		data,
		columns,
		pageCount,
		getRowId: (row) => row.id,
		shallow: false,
		clearOnDefault: true,
	})

	return (
		<div className="data-table-container">
			<DataTable
				table={table}
				actionBar={
					<DataTableActionBar table={table}>
						<DataTableActions table={table} />
					</DataTableActionBar>
				}
			>
				<DataTableToolbar table={table}>
					<Button size="sm">Criar novo processo</Button>
				</DataTableToolbar>
			</DataTable>
		</div>
	)
}
