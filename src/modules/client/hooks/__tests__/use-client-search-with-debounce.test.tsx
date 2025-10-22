import type { SearchClientsOutput } from '@modules/client/actions/search-clients-action'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useClientSearchWithDebounce } from '../use-client-queries'

vi.mock('@modules/client/actions', () => {
	return {
		searchClientsAction: vi.fn(),
		getClientsAction: vi.fn(),
		getClientByIdAction: vi.fn(),
	}
})

import { searchClientsAction } from '@modules/client/actions'

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

afterEach(() => {
	vi.clearAllMocks()
})

describe('useClientSearchWithDebounce', () => {
	it('debounces query changes and triggers search when length >= 2', async () => {
		vi.mocked(searchClientsAction).mockResolvedValue({
			clients: [
				{
					id: 'c1',
					account_id: "1",
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
			() => useClientSearchWithDebounce({ debounceMs: 200, pageSize: 10 }),
			{ wrapper },
		)

		// Type one char: should not enable search and clears query
		act(() => {
			result.current.handleQueryChange('A')
		})
		expect(result.current.query).toBe('')
		expect(result.current.hasActiveFilters).toBe(false)

		// Type two chars: should debounce then set query
		act(() => {
			result.current.handleQueryChange('Al')
		})

		// Advance timers to trigger debounced setQuery
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 200))
		})

		await waitFor(() => expect(result.current.isLoading).toBe(false))

		  expect(result.current.client.length).toBe(1)
		expect(result.current.total).toBe(1)
		expect(vi.mocked(searchClientsAction)).toHaveBeenCalledWith({
			q: 'Al',
			status: undefined,
			page: 1,
			pageSize: 10,
		})
		expect(result.current.hasActiveFilters).toBe(true)

		// Clear filters: should reset query and status
		act(() => {
			result.current.clearFilters()
		})

		expect(result.current.query).toBe('')
		expect(result.current.status).toBeUndefined()
		expect(result.current.hasActiveFilters).toBe(false)
	})

	it('enables search when status is set even if query is empty', async () => {
		vi.mocked(searchClientsAction).mockResolvedValue({
			clients: [],
			total: 0,
			hasMore: false,
		})

		const wrapper = createWrapper()
		const { result } = renderHook(
			() => useClientSearchWithDebounce({ debounceMs: 100 }),
			{ wrapper },
		)

		act(() => {
			result.current.handleStatusChange('ACTIVE')
		})

		await waitFor(() => expect(result.current.isLoading).toBe(false))
		expect(vi.mocked(searchClientsAction)).toHaveBeenCalledWith({
			q: '',
			status: 'ACTIVE',
			page: 1,
			pageSize: 20,
		})
	})
})
