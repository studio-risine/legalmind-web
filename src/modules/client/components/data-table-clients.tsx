'use client'

import { DataTable } from '@components/data-table/data-table'
import { DataTableActionBar } from '@components/data-table/data-table-action-bar'
import { DataTableActions } from '@components/data-table/data-table-actions'
import { DataTableColumnHeader } from '@components/data-table/data-table-column-header'
import { DataTableToolbar } from '@components/data-table/data-table-toolbar'
import { TableCellEmail } from '@components/table/table-cell-email'
import { TableCellPhone } from '@components/table/table-cell-phone'
import {
	TableCellText,
	TableCellTextEmpty,
} from '@components/table/table-cell-text'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import { useDataTable } from '@hooks/use-data-table'
import type { Client } from '@infra/db/schemas/clients'
import { useOperation } from '@modules/dashboard/hooks/use-operation'
import { RiExpandDiagonalLine, RiMoreFill } from '@remixicon/react'
import type { Column, ColumnDef } from '@tanstack/react-table'
import { formatDocumentWithMask } from '@utils/document-mask'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useMemo } from 'react'

interface DataTableClientsProps {
	data: Client[]
	total: number
}

export function DataTableClients({ data, total }: DataTableClientsProps) {
	const { onOpenOperation } = useOperation()
	// Keep pageCount in sync with current perPage from URL state
	const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
	const pageCount = Math.max(1, Math.ceil(total / perPage))

	const columns = useMemo<ColumnDef<Client>[]>(
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
				id: 'name',
				accessorFn: (row) => row.name ?? '',
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Name" />
				),
				cell: ({ row }) => (
					<div className="group relative">
						<TableCellText>{row.original.name}</TableCellText>
						<div className="-top-1 invisible absolute right-0 z-10 rounded duration-100 ease-in-out group-hover:visible">
							<Button size="sm" variant="secondary">
								<RiExpandDiagonalLine />
								Open
							</Button>
						</div>
					</div>
				),
				meta: {
					label: 'Nome',
					placeholder: 'Pesquisar...',
					variant: 'text',
				},
				enableColumnFilter: true,
				minSize: 240,
			},
			{
				id: 'email',
				accessorFn: (row) => row.email ?? '',
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Email" />
				),
				cell: ({ row }) =>
					row.original.email ? (
						<TableCellEmail email={row.original.email} />
					) : (
						<TableCellTextEmpty />
					),
				meta: {
					label: 'Email',
					variant: 'text',
				},
			},
			{
				id: 'phone',
				accessorFn: (row) => row.phone ?? '',
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Phone" />
				),
				cell: ({ row }) =>
					row.original.phone ? (
						<TableCellPhone phone={row.original.phone} />
					) : (
						<TableCellTextEmpty />
					),
				meta: {
					label: 'Telefone',
					variant: 'text',
				},
			},
			{
				id: 'tax_id',
				accessorFn: (row) => row.tax_id ?? '',
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Documento" />
				),
				cell: ({ row }) =>
					row.original.tax_id ? (
						<TableCellText>
							{formatDocumentWithMask(row.original.tax_id)}
						</TableCellText>
					) : (
						<TableCellTextEmpty />
					),
				meta: {
					label: 'Documento',
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
