import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useClientsList, useClientsListResults } from '../use-client-queries'

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

describe('useClientsList and useClientsListResults', () => {
	it('returns customers and total, maps page and perPage correctly', async () => {
		vi.mocked(getClientsAction).mockResolvedValueOnce({
			data: [
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
				{
					id: 'c2',
					account_id: 1,
					type: 'INDIVIDUAL',
					status: 'INACTIVE',
					name: 'Bob',
					email: null,
					phone: null,
					tax_id: null,
					notes: null,
					created_at: new Date(),
					updated_at: null,
					deleted_at: null,
				},
			],
			total: 2,
		})

		const wrapper = createWrapper()
		const { result } = renderHook(
			() => useClientsListResults({ limit: 2, offset: 0, search: 'Al' }),
			{ wrapper },
		)

		await waitFor(() => expect(result.current.isLoading).toBe(false))

		expect(result.current.customers.length).toBe(2)
		expect(result.current.total).toBe(2)
		expect(result.current.hasCustomers).toBe(true)
		expect(result.current.isEmpty).toBe(false)

		expect(vi.mocked(getClientsAction)).toHaveBeenCalledWith({
			searchQuery: 'Al',
			page: 1,
			perPage: 2,
		})
	})

	it('does not run when disabled', async () => {
		const wrapper = createWrapper()
		const { result } = renderHook(
			() =>
				useClientsList({ limit: 2, offset: 0, search: 'Al', enabled: false }),
			{ wrapper },
		)

		// When disabled, the query is idle and not loading
		expect(result.current.isLoading).toBe(false)
		expect(vi.mocked(getClientsAction)).not.toHaveBeenCalled()
	})
})
