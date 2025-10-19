import { QueryClient } from '@tanstack/react-query'

declare global {
	var __reactQueryClient: QueryClient | undefined
}

const GC_TIME = 60 * 60 * 1000
const STALE_TIME = 60 * 60 * 1000
const MUTATION_RETRY = 1
const QUERY_RETRY = 3

export const queryClient =
	globalThis.__reactQueryClient ??
	new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				retry: QUERY_RETRY,
				staleTime: STALE_TIME,
				gcTime: GC_TIME,
			},
			mutations: {
				retry: MUTATION_RETRY,
			},
		},
	})

if (process.env.NODE_ENV !== 'production') {
	globalThis.__reactQueryClient = queryClient
}
