import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useClientById } from '../use-client-queries'

vi.mock('@/modules/client/actions', () => {
	return {
		searchClientsAction: vi.fn(),
		getClientsAction: vi.fn(),
		getClientByIdAction: vi.fn(),
	}
})

import type { ReactNode } from 'react'
import { getClientByIdAction } from '@/modules/client/actions'

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

describe('useClientById', () => {
	it('returns client data when found', async () => {
		vi.mocked(getClientByIdAction).mockResolvedValueOnce({
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
		})

		const wrapper = createWrapper()
		const { result } = renderHook(() => useClientById('c1'), { wrapper })

		await waitFor(() => expect(result.current.isLoading).toBe(false))

		expect(result.current.client?.id).toBe('c1')
		expect(result.current.isError).toBe(false)
		expect(vi.mocked(getClientByIdAction)).toHaveBeenCalledWith({ id: 'c1' })
	})

	it('sets isError when client is not found', async () => {
		vi.mocked(getClientByIdAction).mockResolvedValueOnce(
			null as unknown as never,
		)

		const wrapper = createWrapper()
		const { result } = renderHook(() => useClientById('missing'), { wrapper })

		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.error?.message).toBe('Client not found')
	})
})
