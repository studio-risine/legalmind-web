'use client'

import { useDebouncedCallback } from '@hooks/use-debounced-callback'
import type { Client } from '@infra/db/schemas/clients'
import {
	getClientByIdAction,
	getClientsAction,
	searchClientsAction,
} from '@modules/client/actions'
import type { SearchClientsOutput } from '@modules/client/actions/search-clients-action'
import type { ClientStatus } from '@modules/client/types'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

// =====================
// Query: by ID
// =====================
export interface UseClientQueryOptions {
	enabled?: boolean
	staleTime?: number
	refetchOnWindowFocus?: boolean
	queryOptions?: Omit<
		UseQueryOptions<Client, Error, Client, [string, string, { id: string }]>,
		'enabled' | 'staleTime' | 'refetchOnWindowFocus' | 'queryKey' | 'queryFn'
	>
}

export function useClientQuery(
	id: string,
	options: UseClientQueryOptions = {},
) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000,
		refetchOnWindowFocus = false,
		queryOptions,
	} = options

	return useQuery<Client, Error, Client, [string, string, { id: string }]>({
		queryKey: ['clients', 'byId', { id }],
		queryFn: async () => {
			const result = await getClientByIdAction({ id })

			if (!result) throw new Error('Client not found')

			return result
		},
		enabled,
		staleTime,
		refetchOnWindowFocus,
		...queryOptions,
	})
}

export function useClientById(id: string, options: UseClientQueryOptions = {}) {
	const query = useClientQuery(id, options)

	return {
		client: query.data,
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
export interface UseClientsListOptions {
	status?: ClientStatus
	limit?: number
	offset?: number
	search?: string
	enabled?: boolean
	staleTime?: number
}

export function useClientsList(options: UseClientsListOptions = {}) {
	const {
		status,
		limit = 50,
		offset = 0,
		search,
		enabled = true,
		staleTime = 5 * 60 * 1000,
	} = options

	const page = Math.floor(offset / limit) + 1
	const perPage = limit

	return useQuery<{ client: Client[]; total: number }>({
		queryKey: ['client', 'list', { status, limit, offset, search }],
		queryFn: async () => {
			const result = await getClientsAction({
				searchQuery: search,
				page,
				perPage,
			})
			return { client: result.data ?? [], total: result.total ?? 0 }
		},
		enabled,
		staleTime,
		refetchOnWindowFocus: false,
		retry: 2,
	})
}

export function useActiveClientsList(
	options: Omit<UseClientsListOptions, 'status'> = {},
) {
	return useClientsList({ ...options, status: 'ACTIVE' })
}

export function useAllClientsList(
	options: Omit<UseClientsListOptions, 'status'> = {},
) {
	return useClientsList(options)
}

export function useClientsListWithStatus(
	status: ClientStatus,
	options: Omit<UseClientsListOptions, 'status'> = {},
) {
	return useClientsList({ ...options, status })
}

export function useClientsListResults(options: UseClientsListOptions = {}) {
	const query = useClientsList(options)

	return {
		client: query.data?.client || [],
		total: query.data?.total || 0,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isEmpty:
			!query.isLoading &&
			(!query.data?.client || query.data.client.length === 0),
		hasclient:
			!query.isLoading && query.data?.client && query.data.client.length > 0,
		refetch: query.refetch,
		isFetching: query.isFetching,
	}
}

// =====================
// Query: search
// =====================
export interface UseClientSearchOptions {
	q?: string
	status?: ClientStatus
	pageSize?: number
	enabled?: boolean
	staleTime?: number
}

export function useClientSearch(options: UseClientSearchOptions = {}) {
	const {
		q,
		status,
		pageSize = 20,
		enabled = true,
		staleTime = 2 * 60 * 1000,
	} = options

	return useQuery({
		queryKey: ['client', 'search', { q, status, pageSize }],
		queryFn: () => searchClientsAction({ q, status, page: 1, pageSize }),
		enabled: enabled && (!!q || !!status),
		staleTime,
		refetchOnWindowFocus: false,
		retry: 2,
	})
}

export function useInfiniteClientSearch(options: UseClientSearchOptions = {}) {
	const {
		q,
		status,
		pageSize = 10,
		enabled = true,
		staleTime = 2 * 60 * 1000,
	} = options

	return useInfiniteQuery({
		queryKey: ['client', 'search', 'infinite', { q, status, pageSize }],
		initialPageParam: 1,
		queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
			searchClientsAction({ q, status, page: pageParam, pageSize }),
		getNextPageParam: (
			lastPage: SearchClientsOutput,
			allPages: SearchClientsOutput[],
		) => {
			if (lastPage.hasMore) {
				return allPages.length + 1
			}
			return undefined
		},
		enabled: enabled && (!!q || !!status),
		staleTime,
		refetchOnWindowFocus: false,
		retry: 2,
	})
}

export function useClientSearchQuery(options: UseClientSearchOptions = {}) {
	return useClientSearch(options)
}

export function useClientSearchResults(options: UseClientSearchOptions = {}) {
	const query = useClientSearch(options)

	return {
		client: query.data?.clients || [],
		total: query.data?.total || 0,
		hasMore: query.data?.hasMore || false,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isEmpty:
			!query.isLoading &&
			(!query.data?.clients || query.data.clients.length === 0),
		refetch: query.refetch,
	}
}

// =====================
// Query: search with debounce
// =====================
export interface UseClientSearchWithDebounceOptions {
	initialQuery?: string
	initialStatus?: ClientStatus
	pageSize?: number
	debounceMs?: number
	enabled?: boolean
}

export function useClientSearchWithDebounce(
	options: UseClientSearchWithDebounceOptions = {},
) {
	const {
		initialQuery = '',
		initialStatus,
		pageSize = 20,
		debounceMs = 300,
		enabled = true,
	} = options

	const [query, setQuery] = useState(initialQuery)
	const [status, setStatus] = useState<ClientStatus | undefined>(initialStatus)

	const debouncedSetQuery = useDebouncedCallback(
		(newQuery: string) => setQuery(newQuery),
		debounceMs,
	)

	const searchResults = useClientSearchResults({
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

	const handleStatusChange = useCallback(
		(newStatus: ClientStatus | undefined) => {
			setStatus(newStatus)
		},
		[],
	)

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
export interface UseClientPaginationOptions {
	status?: ClientStatus
	search?: string
	pageSize?: number
	enabled?: boolean
}

export function useClientPagination(options: UseClientPaginationOptions = {}) {
	const { status, search, pageSize = 20, enabled = true } = options

	const [currentPage, setCurrentPage] = useState(1)
	const offset = (currentPage - 1) * pageSize

	const clientQuery = useClientsListResults({
		status,
		search,
		limit: pageSize,
		offset,
		enabled,
	})

	const totalPages = useMemo(() => {
		return Math.ceil(clientQuery.total / pageSize)
	}, [clientQuery.total, pageSize])

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
		client: clientQuery.client,
		total: clientQuery.total,
		isLoading: clientQuery.isLoading,
		isError: clientQuery.isError,
		error: clientQuery.error,
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
		refetch: clientQuery.refetch,
	}
}

// =====================
// Query: stats
// =====================
export interface UseClientStatsOptions {
	enabled?: boolean
}

export function useClientStats(options: UseClientStatsOptions = {}) {
	const { enabled = true } = options

	const allClients = useClientsListResults({
		limit: 1000,
		enabled,
	})

	const stats = useMemo(() => {
		if (!allClients.client.length) {
			return {
				total: 0,
				byStatus: {
					ACTIVE: 0,
					INACTIVE: 0,
					ARCHIVED: 0,
				},
				recentCount: 0,
				activePercentage: 0,
			}
		}

		const clients = allClients.client as Client[]
		const now = new Date()
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

		const byStatus = clients.reduce(
			(acc: Record<ClientStatus, number>, client: Client) => {
				acc[client.status as ClientStatus] =
					(acc[client.status as ClientStatus] || 0) + 1
				return acc
			},
			{} as Record<ClientStatus, number>,
		)

		const recentCount = clients.filter(
			(client) => new Date(client.created_at) > thirtyDaysAgo,
		).length

		const activeCount = byStatus.ACTIVE || 0
		const activePercentage = Math.round((activeCount / clients.length) * 100)

		return {
			total: clients.length,
			byStatus: {
				ACTIVE: byStatus.ACTIVE || 0,
				INACTIVE: byStatus.INACTIVE || 0,
				ARCHIVED: byStatus.ARCHIVED || 0,
			},
			recentCount,
			activePercentage,
		}
	}, [allClients.client])

	return {
		stats,
		isLoading: allClients.isLoading,
		isError: allClients.isError,
		error: allClients.error,
		refetch: allClients.refetch,
	}
}
