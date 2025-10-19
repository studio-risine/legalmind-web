import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { useClientMutation } from '../use-client-mutations'

vi.mock('@/modules/client/actions', () => {
	return {
		insertClientAction: vi.fn(),
		updateClientAction: vi.fn(),
		deleteClientAction: vi.fn(),
		toggleClientStatusAction: vi.fn(),
	}
})

import { toast } from 'sonner'
import { insertClientAction } from '@/modules/client/actions'

function createWrapperAndClient() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})

	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
	return { wrapper, queryClient }
}

describe('use-client-mutations', () => {
	it('createClientAsync succeeds and triggers toast + invalidation', async () => {
		vi.mocked(insertClientAction).mockResolvedValueOnce({
			success: true,
			data: {
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
		})

		const { wrapper, queryClient } = createWrapperAndClient()
		const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

		const { result } = renderHook(() => useClientMutation(), { wrapper })

		await act(async () => {
			await result.current.createClientAsync({
				name: 'Alice',
				email: 'a@example.com',
				phone: '',
				tax_id: '',
			})
		})

		await waitFor(() => expect(result.current.isCreating).toBe(false))

		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['customers'] })
		expect(toast).toHaveBeenCalledWith('Client created successfully.')
	})

	it('createClientAsync fails and triggers error toast', async () => {
		vi.mocked(insertClientAction).mockResolvedValueOnce({
			success: false,
			error: 'Failed',
		})

		const { wrapper } = createWrapperAndClient()
		const { result } = renderHook(() => useClientMutation(), { wrapper })

		await expect(
			result.current.createClientAsync({
				name: 'Bob',
				email: '',
				phone: '',
				tax_id: '',
			}),
		).rejects.toThrow()

		expect(toast).toHaveBeenCalledWith('Failed to create Client.')
	})
})
