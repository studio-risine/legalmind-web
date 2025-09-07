import { QueryClient } from '@tanstack/react-query'

const SCALE_TIME = 1000 * 60 * 5 // 5mins

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
			staleTime: SCALE_TIME,
		},
	},
})
