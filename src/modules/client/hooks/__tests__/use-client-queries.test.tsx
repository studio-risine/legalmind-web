import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { SearchClientsOutput } from '@/modules/client/actions/search-clients-action'
import {
	useClientSearchResults,
	useInfiniteClientSearch,
} from '../use-client-queries'

// Mock actions aggregator used by hooks
vi.mock('@/modules/client/actions', () => {
	return {
		searchClientsAction: vi.fn(),
		getClientsAction: vi.fn(),
		getClientByIdAction: vi.fn(),
	}
})

import { searchClientsAction } from '@/modules/client/actions'

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	})
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}

describe('use-client-queries', () => {
	it('useClientSearchResults returns customers and hasMore correctly', async () => {
		vi.mocked(searchClientsAction).mockResolvedValueOnce({
			customers: [
				{
					id: 'c1',
					account_id: 1,
					type: 'INDIVIDUAL',
					status: 'ACTIVE',
					name: 'Alice',
					email: 'a@example.com',
					phone: null,
					tax_id: null,
					notes: null,
					created_at: new Date(),
					updated_at: null,
					deleted_at: null,
				},
			],
			total: 1,
			hasMore: false,
		} satisfies SearchClientsOutput)

		const wrapper = createWrapper()
		const { result } = renderHook(
			() => useClientSearchResults({ q: 'Ali', pageSize: 10 }),
			{ wrapper },
		)

		await waitFor(() => expect(result.current.isLoading).toBe(false))

		expect(result.current.customers.length).toBe(1)
		expect(result.current.total).toBe(1)
		expect(result.current.hasMore).toBe(false)
		expect(vi.mocked(searchClientsAction)).toHaveBeenCalledWith({
			q: 'Ali',
			status: undefined,
			page: 1,
			pageSize: 10,
		})
	})

	it('useInfiniteClientSearch paginates with getNextPageParam', async () => {
		// Implement mock that returns hasMore=true for page 1 and false for page 2
		vi.mocked(searchClientsAction).mockImplementation(
			async (args?: { page?: number }) => {
				const page = args?.page ?? 1
				const base: Omit<SearchClientsOutput, 'customers'> = {
					total: 2,
					hasMore: page === 1,
				}
				const customers = [
					{
						id: `c${page}`,
						account_id: 1,
						type: 'INDIVIDUAL',
						status: 'ACTIVE',
						name: `User ${page}`,
						email: null,
						phone: null,
						tax_id: null,
						notes: null,
						created_at: new Date(),
						updated_at: null,
						deleted_at: null,
					},
				]
				return { ...base, customers }
			},
		)

		const wrapper = createWrapper()
		const { result } = renderHook(
			() => useInfiniteClientSearch({ q: 'User', pageSize: 1 }),
			{ wrapper },
		)

		// initial page loads
		await waitFor(() => expect(result.current.isLoading).toBe(false))
		expect(result.current.data?.pages[0].customers[0].id).toBe('c1')
		expect(result.current.hasNextPage).toBe(true)

		await result.current.fetchNextPage()

		await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false))

		expect(result.current.data?.pages.length).toBe(2)
		expect(result.current.data?.pages[1].customers[0].id).toBe('c2')
		expect(result.current.hasNextPage).toBe(false)
	})
})
