'use client'

import { DataTableActions } from '@components/data-table'
import { DataTable } from '@components/data-table/data-table'
import { DataTableActionBar } from '@components/data-table/data-table-action-bar'
import { DataTableColumnHeader } from '@components/data-table/data-table-column-header'
import { DataTableToolbar } from '@components/data-table/data-table-toolbar'
import {
	TableCellEmail,
	TableCellPhone,
	TableCellPrimary,
	TableCellText,
	TableCellTextEmpty,
} from '@components/table'
import { Checkbox } from '@components/ui/checkbox'
import { useDataTable } from '@hooks/use-data-table'
import type { Client } from '@infra/db/schemas'
import type { Column, ColumnDef } from '@tanstack/react-table'
import { formatDocumentWithMask } from '@utils/document-mask'
import { useParams, useRouter } from 'next/navigation'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { ClientDialog } from './client-dialog'
import { ClientStatusBadge } from './status-badge'

interface DataTableClientsProps {
	data: Client[]
	total: number
}

export function DataTableClients({ data, total }: DataTableClientsProps) {
	const router = useRouter()
	const params = useParams<{ id: string }>()
	const spaceId = (params?.id ?? '') as string
	const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10))
	const pageCount = Math.max(1, Math.ceil(total / perPage))

	const columns = useMemo<ColumnDef<Client>[]>(
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
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
					/>
				),
				id: 'select',
				meta: {
					label: '#',
				},
				size: 32,
			},
			{
				accessorFn: (row) => row.name ?? '',
				cell: ({ row }) => (
					<TableCellPrimary
						link={`cliente/${row.original.id}`}
						title={row.original.name}
					/>
				),
				enableColumnFilter: true,
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Nome" />
				),
				id: 'name',
				meta: {
					label: 'Nome',
					placeholder: 'Pesquisar...',
					variant: 'text',
				},
				minSize: 240,
			},
			{
				accessorFn: (row) => row.email ?? '',
				cell: ({ row }) =>
					row.original.email ? (
						<TableCellEmail email={row.original.email} />
					) : (
						<TableCellTextEmpty />
					),
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Email" />
				),
				id: 'email',
				meta: {
					label: 'Email',
					variant: 'text',
				},
			},
			{
				accessorFn: (row) => row.phoneNumber ?? '',
				cell: ({ row }) =>
					row.original.phoneNumber ? (
						<TableCellPhone phone={row.original.phoneNumber} />
					) : (
						<TableCellTextEmpty />
					),
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Telefone" />
				),
				id: 'phone',
				meta: {
					label: 'Telefone',
					variant: 'text',
				},
			},
			{
				accessorFn: (row) => row.documentNumber ?? '',
				cell: ({ row }) =>
					row.original.documentNumber ? (
						<TableCellText>
							{formatDocumentWithMask(row.original.documentNumber)}
						</TableCellText>
					) : (
						<TableCellTextEmpty />
					),
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Documento" />
				),
				id: 'document-number',
				meta: {
					label: 'Documento',
					variant: 'text',
				},
			},
			{
				accessorFn: (row) => row.status ?? '',
				cell: ({ row }) =>
					row.original.status ? (
						<ClientStatusBadge status={row.original.status} />
					) : (
						<TableCellTextEmpty />
					),
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				id: 'status',
				meta: {
					label: 'Documento',
					variant: 'text',
				},
			},
		],
		[],
	)

	const { table } = useDataTable({
		clearOnDefault: true,
		columns,
		data,
		getRowId: (row) => row.id,
		pageCount,
		shallow: false,
	})

	const handleRowClick = useCallback((id: string) => {
		router.push(`cliente/${id}`)
	}, [])

	return (
		<div className="data-table-container">
			<DataTable
				actionBar={
					<DataTableActionBar table={table}>
						<DataTableActions
							onDelete={(id) => console.log(id)}
							onEdit={(id) => console.log(id)}
							table={table}
						/>
					</DataTableActionBar>
				}
				table={table}
			>
				<DataTableToolbar table={table}>
					<ClientDialog spaceId={spaceId} />
				</DataTableToolbar>
			</DataTable>
		</div>
	)
}
