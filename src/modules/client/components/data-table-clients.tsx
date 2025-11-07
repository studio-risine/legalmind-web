'use client'

import { DataTableActions } from '@components/data-table'
import { DataTable } from '@components/data-table/data-table'
import { DataTableActionBar } from '@components/data-table/data-table-action-bar'
import { DataTableColumnHeader } from '@components/data-table/data-table-column-header'
import { DataTableToolbar } from '@components/data-table/data-table-toolbar'
import {
	TableCellEmail,
	TableCellName,
	TableCellPhone,
	TableCellText,
	TableCellTextEmpty,
} from '@components/table'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import { useDataTable } from '@hooks/use-data-table'
import type { Client } from '@infra/db/schemas'
import { RiExpandDiagonalLine } from '@remixicon/react'
import type { Column, ColumnDef } from '@tanstack/react-table'
import { formatDocumentWithMask } from '@utils/document-mask'
import Link from 'next/link'
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
					<DataTableColumnHeader column={column} title="Nome" />
				),
				cell: ({ row }) => (
					<div className="group relative">
						<Link href={`cliente/${row.original.id}`}>
							<TableCellName>{row.original.name}</TableCellName>
						</Link>
						<div className="-top-1 invisible absolute right-0 z-10 rounded duration-100 ease-in-out group-hover:visible">
							<Button
								size="sm"
								variant="secondary"
								onClick={() => handleRowClick(row.original.id)}
							>
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
				accessorFn: (row) => row.phoneNumber ?? '',
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Telefone" />
				),
				cell: ({ row }) =>
					row.original.phoneNumber ? (
						<TableCellPhone phone={row.original.phoneNumber} />
					) : (
						<TableCellTextEmpty />
					),
				meta: {
					label: 'Telefone',
					variant: 'text',
				},
			},
			{
				id: 'document-number',
				accessorFn: (row) => row.documentNumber ?? '',
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Documento" />
				),
				cell: ({ row }) =>
					row.original.documentNumber ? (
						<TableCellText>
							{formatDocumentWithMask(row.original.documentNumber)}
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
				id: 'status',
				accessorFn: (row) => row.status ?? '',
				header: ({ column }: { column: Column<Client, unknown> }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				cell: ({ row }) =>
					row.original.status ? (
						<ClientStatusBadge status={row.original.status} />
					) : (
						<TableCellTextEmpty />
					),
				meta: {
					label: 'Documento',
					variant: 'text',
				},
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

	const handleRowClick = useCallback((id: string) => {
		router.push(`cliente/${id}`)
	}, [])

	return (
		<div className="data-table-container">
			<DataTable
				table={table}
				actionBar={
					<DataTableActionBar table={table}>
						<DataTableActions
							table={table}
							onEdit={(id) => console.log(id)}
							onDelete={(id) => console.log(id)}
						/>
					</DataTableActionBar>
				}
			>
				<DataTableToolbar table={table}>
					<ClientDialog spaceId={spaceId} />
				</DataTableToolbar>
			</DataTable>
		</div>
	)
}
