'use client'

import { useDebouncedCallback } from '@hooks/use-debounced-callback'
import type { Process } from '@infra/db/schemas/processes'
import {
	getProcessByIdAction,
	getProcessesAction,
	searchProcessesAction,
} from '@modules/process/actions'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

// =====================
// Query: by ID
// =====================
export interface UseProcessQueryOptions {
	enabled?: boolean
	staleTime?: number
	refetchOnWindowFocus?: boolean
	queryOptions?: Omit<
		UseQueryOptions<Process, Error, Process, [string, string, { id: string }]>,
		'enabled' | 'staleTime' | 'refetchOnWindowFocus' | 'queryKey' | 'queryFn'
	>
}

export function useProcessQuery(
	id: string,
	options: UseProcessQueryOptions = {},
) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000,
		refetchOnWindowFocus = false,
		queryOptions,
	} = options

	return useQuery<Process, Error, Process, [string, string, { id: string }]>({
		queryKey: ['processes', 'byId', { id }],
		queryFn: async () => {
			const res = await getProcessByIdAction({ id })
			if (!res) {
				throw new Error('Process not found')
			}
			return res
		},
		enabled,
		staleTime,
		refetchOnWindowFocus,
		...queryOptions,
	})
}

export function useProcessById(
	id: string,
	options: UseProcessQueryOptions = {},
) {
	const query = useProcessQuery(id, options)

	return {
		process: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		isFetching: query.isFetching,
	}
}

// =====================
// Query: list (paginated)
// =====================
export interface UseProcessesListOptions {
	status?: string
	limit?: number
	offset?: number
	search?: string
	sortBy?: 'created_at' | 'title'
	sortDirection?: 'asc' | 'desc'
	enabled?: boolean
	staleTime?: number
}

export function useProcessesList(options: UseProcessesListOptions = {}) {
	const {
		status,
		limit = 50,
		offset = 0,
		search,
		sortBy,
		sortDirection,
		enabled = true,
		staleTime = 5 * 60 * 1000,
	} = options

	const page = Math.floor(offset / limit) + 1
	const perPage = limit

	return useQuery<{ processes: Process[]; total: number }>({
		queryKey: [
			'processes',
			'list',
			{ status, limit, offset, search, sortBy, sortDirection },
		],
		queryFn: async () => {
			const result = await getProcessesAction({
				searchQuery: search,
				status,
				sortBy,
				sortDirection,
				page,
				perPage,
			})
			return { processes: result.data ?? [], total: result.total ?? 0 }
		},
		enabled,
		staleTime,
		refetchOnWindowFocus: false,
		retry: 2,
	})
}

export function useActiveProcessesList(
	options: Omit<UseProcessesListOptions, 'status'> = {},
) {
	return useProcessesList({ ...options, status: 'ACTIVE' })
}

export function useAllProcessesList(
	options: Omit<UseProcessesListOptions, 'status'> = {},
) {
	return useProcessesList(options)
}

export function useProcessesListWithStatus(
	status: string,
	options: Omit<UseProcessesListOptions, 'status'> = {},
) {
	return useProcessesList({ ...options, status })
}

export function useProcessesListResults(options: UseProcessesListOptions = {}) {
	const query = useProcessesList(options)

	return {
		processes: query.data?.processes || [],
		total: query.data?.total || 0,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isEmpty:
			!query.isLoading &&
			(!query.data?.processes || query.data.processes.length === 0),
		hasProcesses:
			!query.isLoading &&
			query.data?.processes &&
			query.data.processes.length > 0,
		refetch: query.refetch,
		isFetching: query.isFetching,
	}
}

// =====================
// Query: search
// =====================
export interface UseProcessSearchOptions {
	q?: string
	status?: string
	pageSize?: number
	enabled?: boolean
	staleTime?: number
}

export function useProcessSearch(options: UseProcessSearchOptions = {}) {
	const {
		q,
		status,
		pageSize = 20,
		enabled = true,
		staleTime = 2 * 60 * 1000,
	} = options

	return useQuery({
		queryKey: ['processes', 'search', { q, status, pageSize }],
		queryFn: () => searchProcessesAction({ q, status, page: 1, pageSize }),
		enabled: enabled && (!!q || !!status),
		staleTime,
		refetchOnWindowFocus: false,
		retry: 2,
	})
}

export function useProcessSearchQuery(options: UseProcessSearchOptions = {}) {
	return useProcessSearch(options)
}

export function useProcessSearchResults(options: UseProcessSearchOptions = {}) {
	const query = useProcessSearch(options)

	return {
		processes: query.data?.processes || [],
		total: query.data?.total || 0,
		hasMore: query.data?.hasMore || false,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isEmpty:
			!query.isLoading &&
			(!query.data?.processes || query.data.processes.length === 0),
		refetch: query.refetch,
	}
}

// =====================
// Query: search with debounce
// =====================
export interface UseProcessSearchWithDebounceOptions {
	initialQuery?: string
	initialStatus?: string
	pageSize?: number
	debounceMs?: number
	enabled?: boolean
}

export function useProcessSearchWithDebounce(
	options: UseProcessSearchWithDebounceOptions = {},
) {
	const {
		initialQuery = '',
		initialStatus,
		pageSize = 20,
		debounceMs = 300,
		enabled = true,
	} = options

	const [query, setQuery] = useState(initialQuery)
	const [status, setStatus] = useState<string | undefined>(initialStatus)

	const debouncedSetQuery = useDebouncedCallback(
		(newQuery: string) => setQuery(newQuery),
		debounceMs,
	)

	const searchResults = useProcessSearchResults({
		q: query,
		status,
		pageSize,
		enabled: enabled && (query.length >= 2 || !!status),
	})

	const handleQueryChange = useCallback(
		(newQuery: string) => {
			if (newQuery.length < 2) {
				setQuery('')
			} else {
				debouncedSetQuery(newQuery)
			}
		},
		[debouncedSetQuery],
	)

	const handleStatusChange = useCallback((newStatus: string | undefined) => {
		setStatus(newStatus)
	}, [])

	const clearFilters = useCallback(() => {
		setQuery('')
		setStatus(undefined)
	}, [])

	const hasActiveFilters = useMemo(() => {
		return query.length >= 2 || !!status
	}, [query, status])

	return {
		query,
		status,
		hasActiveFilters,
		handleQueryChange,
		handleStatusChange,
		clearFilters,
		...searchResults,
	}
}

// =====================
// Query: pagination
// =====================
export interface UseProcessPaginationOptions {
	status?: string
	search?: string
	pageSize?: number
	sortBy?: 'created_at' | 'title'
	sortDirection?: 'asc' | 'desc'
	enabled?: boolean
}

export function useProcessPagination(
	options: UseProcessPaginationOptions = {},
) {
	const {
		status,
		search,
		pageSize = 20,
		sortBy,
		sortDirection,
		enabled = true,
	} = options

	const [currentPage, setCurrentPage] = useState(1)
	const offset = (currentPage - 1) * pageSize

	const processesQuery = useProcessesListResults({
		status,
		search,
		limit: pageSize,
		offset,
		sortBy,
		sortDirection,
		enabled,
	})

	const totalPages = useMemo(() => {
		return Math.ceil(processesQuery.total / pageSize)
	}, [processesQuery.total, pageSize])

	const hasNextPage = useMemo(() => {
		return currentPage < totalPages
	}, [currentPage, totalPages])

	const hasPreviousPage = useMemo(() => {
		return currentPage > 1
	}, [currentPage])

	const goToPage = useCallback(
		(page: number) => {
			if (page >= 1 && page <= totalPages) {
				setCurrentPage(page)
			}
		},
		[totalPages],
	)

	const goToNextPage = useCallback(() => {
		if (hasNextPage) {
			setCurrentPage((prev) => prev + 1)
		}
	}, [hasNextPage])

	const goToPreviousPage = useCallback(() => {
		if (hasPreviousPage) {
			setCurrentPage((prev) => prev - 1)
		}
	}, [hasPreviousPage])

	const goToFirstPage = useCallback(() => {
		setCurrentPage(1)
	}, [])

	const goToLastPage = useCallback(() => {
		setCurrentPage(totalPages)
	}, [totalPages])

	const resetPagination = useCallback(() => {
		setCurrentPage(1)
	}, [])

	return {
		processes: processesQuery.processes,
		total: processesQuery.total,
		isLoading: processesQuery.isLoading,
		isError: processesQuery.isError,
		error: processesQuery.error,
		currentPage,
		totalPages,
		pageSize,
		hasNextPage,
		hasPreviousPage,
		goToPage,
		goToNextPage,
		goToPreviousPage,
		goToFirstPage,
		goToLastPage,
		resetPagination,
		refetch: processesQuery.refetch,
	}
}

// =====================
// Query: stats
// =====================
export interface UseProcessStatsOptions {
	enabled?: boolean
}

export function useProcessStats(options: UseProcessStatsOptions = {}) {
	const { enabled = true } = options

	const allProcesses = useProcessesListResults({
		limit: 1000,
		enabled,
	})

	const stats = useMemo(() => {
		if (!allProcesses.processes.length) {
			return {
				total: 0,
				byStatus: {} as Record<string, number>,
				recentCount: 0,
			}
		}

		const processes = allProcesses.processes as Process[]
		const now = new Date()
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

		const byStatus = processes.reduce(
			(acc: Record<string, number>, process: Process) => {
				const status = process.status || 'UNKNOWN'
				acc[status] = (acc[status] || 0) + 1
				return acc
			},
			{} as Record<string, number>,
		)

		const recentCount = processes.filter(
			(process) => new Date(process.created_at) > thirtyDaysAgo,
		).length

		return {
			total: processes.length,
			byStatus,
			recentCount,
		}
	}, [allProcesses.processes])

	return {
		stats,
		isLoading: allProcesses.isLoading,
		isError: allProcesses.isError,
		error: allProcesses.error,
		refetch: allProcesses.refetch,
	}
}
