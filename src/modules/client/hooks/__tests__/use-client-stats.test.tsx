import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useClientStats } from '../use-client-queries'

// Mock actions aggregator used by hooks
vi.mock('@modules/client/actions', () => {
	return {
		searchClientsAction: vi.fn(),
		getClientsAction: vi.fn(),
		getClientByIdAction: vi.fn(),
	}
})

import { getClientsAction } from '@modules/client/actions'

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

describe('useClientStats', () => {
	it('computes totals, byStatus, recentCount, and activePercentage', async () => {
		const now = Date.now()
		const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000)
		const fortyDaysAgo = new Date(now - 40 * 24 * 60 * 60 * 1000)

		vi.mocked(getClientsAction).mockResolvedValueOnce({
			data: [
				{
					id: 'c1',
					account_id: 1,
					type: 'INDIVIDUAL',
					status: 'ACTIVE',
					name: 'Alice',
					email: null,
					phone: null,
					tax_id: null,
					notes: null,
					created_at: tenDaysAgo,
					updated_at: null,
					deleted_at: null,
				},
				{
					id: 'c2',
					account_id: 1,
					type: 'INDIVIDUAL',
					status: 'ACTIVE',
					name: 'Bob',
					email: null,
					phone: null,
					tax_id: null,
					notes: null,
					created_at: tenDaysAgo,
					updated_at: null,
					deleted_at: null,
				},
				{
					id: 'c3',
					account_id: 1,
					type: 'INDIVIDUAL',
					status: 'INACTIVE',
					name: 'Carl',
					email: null,
					phone: null,
					tax_id: null,
					notes: null,
					created_at: tenDaysAgo,
					updated_at: null,
					deleted_at: null,
				},
				{
					id: 'c4',
					account_id: 1,
					type: 'INDIVIDUAL',
					status: 'ARCHIVED',
					name: 'Dana',
					email: null,
					phone: null,
					tax_id: null,
					notes: null,
					created_at: fortyDaysAgo,
					updated_at: null,
					deleted_at: null,
				},
			],
			total: 4,
		})

		const wrapper = createWrapper()
		const { result } = renderHook(() => useClientStats(), { wrapper })

		await waitFor(() => expect(result.current.isLoading).toBe(false))

		expect(vi.mocked(getClientsAction)).toHaveBeenCalledWith({
			searchQuery: undefined,
			page: 1,
			perPage: 1000,
		})

		expect(result.current.stats.total).toBe(4)
		expect(result.current.stats.byStatus.ACTIVE).toBe(2)
		expect(result.current.stats.byStatus.INACTIVE).toBe(1)
		expect(result.current.stats.byStatus.ARCHIVED).toBe(1)
		expect(result.current.stats.recentCount).toBe(3)
		expect(result.current.stats.activePercentage).toBe(50)
	})
})
