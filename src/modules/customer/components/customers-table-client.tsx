'use client'

import { RiMoreFill } from '@remixicon/react'
import type { Column, ColumnDef } from '@tanstack/react-table'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import * as React from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDataTable } from '@/hooks/use-data-table'
import type { ClientDatabase } from '../types'
import { CustomerStatusBadge, customerStatusMap } from './customer-status-badge'
import { clients as data } from './mock'

export function CustomersDataTable() {
	const [name] = useQueryState('name', parseAsString.withDefault(''))
	const [status] = useQueryState(
		'status',
		parseAsArrayOf(parseAsString).withDefault([]),
	)

	console.log(name, status)

	const filteredData = React.useMemo(() => {
		return data.filter((client) => {
			const matchesName =
				name === '' || client.name.toLowerCase().includes(name.toLowerCase())
			const matchesStatus =
				status.length === 0 || status.includes(client.status)

			return matchesName && matchesStatus
		})
	}, [name, status])

	const columns = React.useMemo<ColumnDef<ClientDatabase>[]>(
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
				size: 32,
				enableSorting: false,
				enableHiding: false,
			},
			{
				id: 'name',
				accessorKey: 'name',
				header: ({ column }: { column: Column<ClientDatabase, unknown> }) => (
					<DataTableColumnHeader column={column} title="Name" />
				),
				cell: ({ cell }) => (
					<div key={cell.row.index}>
						{cell.getValue<ClientDatabase['name']>()}
					</div>
				),
				meta: {
					label: 'Name',
					placeholder: 'Search names...',
					variant: 'text',
				},
				enableColumnFilter: true,
				enableSorting: true,
				enableHiding: true,
			},
			{
				id: 'email',
				accessorKey: 'email',
				header: ({ column }: { column: Column<ClientDatabase, unknown> }) => (
					<DataTableColumnHeader column={column} title="Email" />
				),
				cell: ({ cell }) => {
					const email = cell.getValue<ClientDatabase['email']>()

					return (
						<Badge variant="outline" className="capitalize">
							{email}
						</Badge>
					)
				},
				meta: {
					label: 'Email',
					variant: 'text',
				},
				enableSorting: true,
			},
			{
				id: 'phone',
				accessorKey: 'phone',
				header: ({ column }: { column: Column<ClientDatabase, unknown> }) => (
					<DataTableColumnHeader column={column} title="Phone" />
				),
				cell: ({ cell }) => (
					<div>{cell.getValue<ClientDatabase['phone']>()}</div>
				),
				meta: {
					label: 'Phone',
					variant: 'text',
				},
				enableSorting: true,
			},
			{
				id: 'createdAt',
				accessorKey: 'createdAt',
				header: ({ column }: { column: Column<ClientDatabase, unknown> }) => (
					<DataTableColumnHeader column={column} title="Created At" />
				),
				cell: ({ cell }) => {
					const date = cell.getValue<ClientDatabase['createdAt']>()
					return <div>{new Date(date).toLocaleDateString()}</div>
				},
				meta: {
					label: 'Created At',
					variant: 'date',
				},
				enableSorting: true,
			},
			{
				id: 'status',
				accessorKey: 'status',
				header: ({ column }: { column: Column<ClientDatabase, unknown> }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				cell: ({ cell }) => {
					const status = cell.getValue<ClientDatabase['status']>()
					const key = `${status}-${cell.row.index}`

					return <CustomerStatusBadge status={status} key={key} />
				},
				meta: {
					label: 'Status',
					variant: 'select',
					options: Object.entries(customerStatusMap).map(([value, label]) => ({
						label,
						value,
					})),
				},
				enableSorting: true,
			},
			{
				id: 'actions',
				cell: function Cell() {
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon">
									<RiMoreFill size={24} />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>Edit</DropdownMenuItem>
								<DropdownMenuItem variant="destructive">
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)
				},
				size: 32,
				enableSorting: false,
				enableHiding: false,
			},
		],
		[],
	)

	const { table } = useDataTable({
		data: filteredData,
		columns,
		pageCount: 1,
		initialState: {
			sorting: [{ id: 'createdAt', desc: true }],
			columnPinning: { right: ['actions'] },
		},
		getRowId: (row) => row.id,
	})

	return (
		<DataTable table={table}>
			<DataTableToolbar table={table}>
				{/* <DataTableSortList table={table} /> */}
			</DataTableToolbar>
		</DataTable>
	)
}
