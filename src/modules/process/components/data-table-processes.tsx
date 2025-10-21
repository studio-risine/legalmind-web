'use client'

import { DataTable } from '@components/data-table'
import { DataTableColumnHeader } from '@components/data-table/data-table-column-header'
import { Button } from '@components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import type { Process } from '@infra/db/schemas/processes'
import { useClientsList } from '@modules/client/hooks/use-client-queries'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
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
import { ProcessStatusBadge } from './status-badge'

interface DataTableProcessesProps {
	data: Process[]
	total: number
	onView?: (process: Process) => void
	onEdit?: (process: Process) => void
	onDelete?: (process: Process) => void
}

export function DataTableProcesses({
	data,
	onView,
	onEdit,
	onDelete,
}: DataTableProcessesProps) {
	const { data: clientsData } = useClientsList({})
	const columns: ColumnDef<Process>[] = useMemo(
		() => [
			{
				accessorKey: 'title',
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Título" />
				),
				cell: ({ row }) => (
					<div className="font-medium">{row.getValue('title')}</div>
				),
				enableSorting: true,
				enableHiding: false,
			},
			{
				accessorKey: 'cnj',
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="CNJ" />
				),
				cell: ({ row }) => {
					const cnj = row.getValue('cnj') as string
					return (
						<div className="font-mono text-sm">{cnj || 'Não informado'}</div>
					)
				},
			},
			{
				accessorKey: 'client_id',
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Cliente" />
				),
				cell: ({ row }) => {
					const clientId = row.getValue('client_id') as string
					const client = clientsData?.customers.find((c) => c.id === clientId)
					return (
						<div className="text-sm">
							{client
								? client.name
								: clientId
									? 'Carregando...'
									: 'Sem cliente'}
						</div>
					)
				},
			},
			{
				accessorKey: 'status',
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				cell: ({ row }) => {
					const status = row.getValue('status') as string
					return <ProcessStatusBadge status={status} />
				},
			},
			{
				accessorKey: 'created_at',
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Criado em" />
				),
				cell: ({ row }) => {
					const date = new Date(row.getValue('created_at') as string)
					return (
						<div className="text-muted-foreground text-sm">
							{date.toLocaleDateString('pt-BR', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric',
							})}
						</div>
					)
				},
			},
			{
				id: 'actions',
				cell: function Cell({ row }) {
					const process = row.original
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
								>
									<DotsHorizontalIcon className="h-4 w-4" />
									<span className="sr-only">Abrir menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[160px]">
								<DropdownMenuItem onClick={() => onView?.(process)}>
									Ver detalhes
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => onEdit?.(process)}>
									Editar
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => onDelete?.(process)}
									className="text-red-600"
								>
									Excluir
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)
				},
			},
		],
		[clientsData, onView, onEdit, onDelete],
	)

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	})

	return <DataTable table={table} />
}
