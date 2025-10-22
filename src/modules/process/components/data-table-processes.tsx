'use client'

import {
	DataTable,
	DataTableActionBar,
	DataTableActions,
	DataTableToolbar,
} from '@components/data-table'
import { DataTableColumnHeader } from '@components/data-table/data-table-column-header'
import { TableCellText } from '@components/table/table-cell-text'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { useDataTable } from '@hooks/use-data-table'
import type { Process } from '@infra/db/schemas/processes'
import { useOperation } from '@modules/dashboard/hooks/use-operation'
import { RiExpandDiagonalLine, RiMoreFill } from '@remixicon/react'
import {
	type Column,
	type ColumnDef,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

// import { ProcessStatusBadge } from './status-badge'

interface DataTableProcessesProps {
	data: Process[]
	total: number
	onView?: (process: Process) => void
}

export function DataTableProcesses({ data, total }: DataTableProcessesProps) {
	const { onOpenOperation } = useOperation()

	console.log('Rendering DataTableProcesses with data:', data)

	// const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
	// const pageCount = Math.max(1, Math.ceil(total / perPage))

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
				id: 'title',
				accessorFn: (row) => row.title ?? '',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="Title" />
				),
				cell: ({ row }) => (
					<div className="group relative">
						<TableCellText>{row.original.title}</TableCellText>
						<div className="-top-1 invisible absolute right-0 z-10 rounded duration-100 ease-in-out group-hover:visible">
							<Button size="sm" variant="secondary">
								<RiExpandDiagonalLine />
								Open
							</Button>
						</div>
					</div>
				),
				meta: {
					label: 'Title',
					placeholder: 'Pesquisar...',
					variant: 'text',
				},
				enableColumnFilter: true,
				minSize: 240,
			},
			{
				id: 'cnj',
				accessorFn: (row) => row.cnj ?? '',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="CNJ" />
				),
				cell: ({ row }) => {
					const cnj = row.getValue('cnj') as string
					return (
						<div className="font-mono text-sm">{cnj || 'Não informado'}</div>
					)
				},
				meta: {
					label: 'Email',
					variant: 'text',
				},
			},
			{
				id: 'client_id',
				accessorFn: (row) => row.client_id ?? '',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="Cliente" />
				),
				cell: ({ row }) => {
					const clientId = row.getValue('client_id') as string
					// const client = clientsData?.customers.find((item) => item.id === clientId)

					return <div className="text-sm">{clientId}</div>
				},
				meta: {
					label: 'Telefone',
					variant: 'text',
				},
			},
			{
				id: 'status',
				accessorFn: 'status',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				cell: ({ row }) => {
					const status = row.getValue('status') as string
					return <span> {status} </span>
				},
				meta: {
					label: 'Status',
					variant: 'text',
				},
			},
			{
				id: 'created_at',
				accessorFn: 'status',
				header: ({ column }: { column: Column<Process, unknown> }) => (
					<DataTableColumnHeader column={column} title="Criado em" />
				),
				cell: ({ row }) => {
					const date = row.getValue('created_at') as string
					return <span> {date} </span>
				},
				meta: {
					label: 'Status',
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
								<DropdownMenuItem>Open</DropdownMenuItem>
								<DropdownMenuItem>Edit</DropdownMenuItem>
								<DropdownMenuItem>Delete</DropdownMenuItem>
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
		pageCount: 1,
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
						<DataTableActions
							table={table}
							// onEdit={(ids) =>
							// 	// openOperation({
							// 	//  entity: 'client',
							// 	//  operation: 'edit',
							// 	//  id: ids[0],
							// 	// })
							// }
							// onDelete={(id: string) =>
							// 	// openOperation({
							// 	//  entity: 'client',
							// 	//  operation: 'delete',
							// 	//  onConfirm: async () => console.log('delete', id),
							// 	// })
							// }
						/>
					</DataTableActionBar>
				}
			>
				<DataTableToolbar table={table}>
					<Button
						onClick={() =>
							onOpenOperation({
								entity: 'client',
								operation: 'create',
							})
						}
						size="sm"
					>
						Criar novo
					</Button>
				</DataTableToolbar>
			</DataTable>
		</div>
	)
}
