'use client'

import type { Space } from '@infra/db/schemas/spaces'
import { getSpaceByIdAction, listSpacesAction } from '@modules/space/actions'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

// =====================
// Query: by ID
// =====================
export interface UseSpaceQueryOptions {
	enabled?: boolean
	staleTime?: number
	refetchOnWindowFocus?: boolean
	queryOptions?: Omit<
		UseQueryOptions<Space, Error, Space, [string, string, { id: string }]>,
		'enabled' | 'staleTime' | 'refetchOnWindowFocus' | 'queryKey' | 'queryFn'
	>
}

export function useSpaceQuery(id: string, options: UseSpaceQueryOptions = {}) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000,
		refetchOnWindowFocus = false,
		queryOptions,
	} = options

	return useQuery<Space, Error, Space, [string, string, { id: string }]>({
		queryKey: ['spaces', 'byId', { id }],
		queryFn: async () => {
			const result = await getSpaceByIdAction({ id })

			if (!result) throw new Error('Space not found')

			return result
		},
		enabled: enabled && !!id,
		staleTime,
		refetchOnWindowFocus,
		...queryOptions,
	})
}

export function useSpaceById(id: string, options: UseSpaceQueryOptions = {}) {
	const query = useSpaceQuery(id, options)

	return {
		space: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
		isFetching: query.isFetching,
	}
}

// export function useSpaceByUserId(userId: string, options: UseSpaceQueryOptions = {}) {
// 	return useSpaceById(userId, options)
// }

// =====================
// Query: list all spaces
// =====================
export interface UseSpacesQueryOptions {
	enabled?: boolean
	staleTime?: number
	refetchOnWindowFocus?: boolean
	queryOptions?: Omit<
		UseQueryOptions<Space[], Error, Space[], [string, string]>,
		'enabled' | 'staleTime' | 'refetchOnWindowFocus' | 'queryKey' | 'queryFn'
	>
}

export function useSpacesQuery(options: UseSpacesQueryOptions = {}) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000,
		refetchOnWindowFocus = false,
		queryOptions,
	} = options

	return useQuery<Space[], Error, Space[], [string, string]>({
		queryKey: ['spaces', 'list'],
		queryFn: async () => {
			const result = await listSpacesAction()
			return result || []
		},
		enabled,
		staleTime,
		refetchOnWindowFocus,
		...queryOptions,
	})
}

export function useSpacesList(options: UseSpacesQueryOptions = {}) {
	const query = useSpacesQuery(options)

	return {
		spaces: query.data || [],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isEmpty: !query.isLoading && (!query.data || query.data.length === 0),
		hasSpaces: !query.isLoading && query.data && query.data.length > 0,
		refetch: query.refetch,
		isFetching: query.isFetching,
	}
}

// =====================
// Combined queries interface
// =====================
export interface UseSpaceQueriesOptions {
	spaceId?: string
	spaceQueryOptions?: UseSpaceQueryOptions
	spacesQueryOptions?: UseSpacesQueryOptions
}

export function useSpaceQueries(options: UseSpaceQueriesOptions = {}) {
	const { spaceId, spaceQueryOptions = {}, spacesQueryOptions = {} } = options

	const spaceQuery = useSpaceQuery(spaceId || '', {
		...spaceQueryOptions,
		enabled: !!spaceId && (spaceQueryOptions.enabled ?? true),
	})

	const spacesQuery = useSpacesQuery(spacesQueryOptions)

	return {
		// Single space query
		space: spaceQuery.data,
		isSpaceLoading: spaceQuery.isLoading,
		isSpaceError: spaceQuery.isError,
		spaceError: spaceQuery.error,
		refetchSpace: spaceQuery.refetch,

		// Spaces list query
		spaces: spacesQuery.data || [],
		isSpacesLoading: spacesQuery.isLoading,
		isSpacesError: spacesQuery.isError,
		spacesError: spacesQuery.error,
		refetchSpaces: spacesQuery.refetch,

		// Combined states
		isLoading: spaceQuery.isFetching || spacesQuery.isFetching,
		hasErrors: spaceQuery.isError || spacesQuery.isError,
	}
}
