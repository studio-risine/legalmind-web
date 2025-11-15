'use client'

import type { Process } from '@infra/db/schemas/core'
import { formatProcessNumber } from '@utils/formatters/process-number'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Process list table with filters
 * TODO: Integrate with TanStack Table for advanced features (sorting, pagination, filtering)
 * Current implementation: Basic table with mock data
 */
export function ProcessListTable() {
	const [statusFilter, setStatusFilter] = useState<string>('all')

	// TODO: Replace with actual data from queryProcessesAction
	const processes: Process[] = []

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex gap-2">
				<select
					className="rounded-md border border-input bg-background px-3 py-2 text-sm"
					onChange={(e) => setStatusFilter(e.target.value)}
					value={statusFilter}
				>
					<option value="all">All Status</option>
					<option value="ACTIVE">Active</option>
					<option value="ARCHIVED">Archived</option>
					<option value="PENDING">Pending</option>
					<option value="CLOSED">Closed</option>
				</select>
			</div>

			{/* Table */}
			<div className="rounded-lg border">
				<table className="w-full">
					<thead className="border-b bg-muted/50">
						<tr>
							<th className="p-4 text-left font-medium text-sm">Process Number</th>
							<th className="p-4 text-left font-medium text-sm">Title</th>
							<th className="p-4 text-left font-medium text-sm">Status</th>
							<th className="p-4 text-left font-medium text-sm">Court</th>
							<th className="p-4 text-left font-medium text-sm">Class</th>
							<th className="p-4 text-left font-medium text-sm">Created At</th>
							<th className="p-4 text-left font-medium text-sm">Actions</th>
						</tr>
					</thead>
					<tbody>
						{processes.length === 0 ? (
							<tr>
								<td className="p-8 text-center text-muted-foreground" colSpan={7}>
									No processes found. Create a new process or import from CNJ/CSV.
								</td>
							</tr>
						) : (
							processes.map((process) => (
								<tr className="border-b hover:bg-muted/50" key={process._id}>
									<td className="p-4 text-sm">{formatProcessNumber(process.processNumber)}</td>
									<td className="p-4 font-medium text-sm">{process.title}</td>
									<td className="p-4 text-sm">
										<span
											className={`inline-flex rounded-full px-2 py-1 font-semibold text-xs ${
												process.status === 'ACTIVE'
													? 'bg-green-100 text-green-800'
													: process.status === 'ARCHIVED'
														? 'bg-gray-100 text-gray-800'
														: 'bg-blue-100 text-blue-800'
											}`}
										>
											{process.status}
										</span>
									</td>
									<td className="p-4 text-sm">{process.court || '—'}</td>
									<td className="p-4 text-sm">{process.courtClass || '—'}</td>
									<td className="p-4 text-sm">
										{new Date(process.createdAt).toLocaleDateString()}
									</td>
									<td className="p-4 text-sm">
										<Link className="text-primary hover:underline" href={`/process/${process._id}`}>
											View
										</Link>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination placeholder */}
			{processes.length > 0 && (
				<div className="flex items-center justify-between">
					<p className="text-muted-foreground text-sm">
						Showing {processes.length} of {processes.length} processes
					</p>
					<div className="flex gap-2">
						<button
							className="rounded-md border border-input bg-background px-3 py-2 font-medium text-sm hover:bg-accent"
							disabled
							type="button"
						>
							Previous
						</button>
						<button
							className="rounded-md border border-input bg-background px-3 py-2 font-medium text-sm hover:bg-accent"
							disabled
							type="button"
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
