import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useClientPagination } from '../use-client-queries'

// Mock actions aggregator used by hooks
vi.mock('@/modules/client/actions', () => {
	return {
		searchClientsAction: vi.fn(),
		getClientsAction: vi.fn(),
		getClientByIdAction: vi.fn(),
	}
})

import { getClientsAction } from '@/modules/client/actions'

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

describe('useClientPagination', () => {
	it('manages page state and boundaries correctly', async () => {
		vi.mocked(getClientsAction).mockImplementation(
			async (args?: { page?: number; perPage?: number }) => {
				const page = args?.page ?? 1
				return {
					data: [
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
					],
					total: 40, // 2 pages when pageSize = 20
				}
			},
		)

		const wrapper = createWrapper()
		const { result } = renderHook(() => useClientPagination({ pageSize: 20 }), {
			wrapper,
		})

		await waitFor(() => expect(result.current.isLoading).toBe(false))

		expect(result.current.currentPage).toBe(1)
		expect(result.current.totalPages).toBe(2)
		expect(result.current.hasNextPage).toBe(true)
		expect(result.current.hasPreviousPage).toBe(false)

		// Ensure totalPages is computed before moving pages
		await waitFor(() => expect(result.current.totalPages).toBe(2))

		act(() => {
			result.current.goToPage(2)
		})

		// state update is synchronous; no need to wait
		expect(result.current.currentPage).toBe(2)

		// Wait for any refetch to settle before asserting derived flags
		await waitFor(() => expect(result.current.isLoading).toBe(false))

		expect(result.current.hasNextPage).toBe(false)
		expect(result.current.hasPreviousPage).toBe(true)
		expect(result.current.currentPage).toBe(2)

		const lastPage = result.current.totalPages

		act(() => {
			result.current.goToPage(lastPage + 1) // should not exceed last page
		})

		expect(result.current.currentPage).toBe(2)

		act(() => {
			result.current.goToPreviousPage()
		})

		expect(result.current.currentPage).toBe(1)

		act(() => {
			result.current.goToPage(0) // invalid page
		})

		expect(result.current.currentPage).toBe(1)

		act(() => {
			result.current.resetPagination()
		})

		expect(result.current.currentPage).toBe(1)

		// Validate mapping to getClientsAction calls
		expect(vi.mocked(getClientsAction)).toHaveBeenNthCalledWith(1, {
			searchQuery: undefined,
			page: 1,
			perPage: 20,
		})
		expect(vi.mocked(getClientsAction)).toHaveBeenNthCalledWith(2, {
			searchQuery: undefined,
			page: 2,
			perPage: 20,
		})
	})
})
