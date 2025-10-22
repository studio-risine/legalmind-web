import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccountMutations, useAccountsQuery } from '../'

// Mock the actions
vi.mock('../../actions', () => ({
	insertAccountAction: vi.fn(),
	updateAccountAction: vi.fn(),
	deleteAccountAction: vi.fn(),
	listAccountsAction: vi.fn(),
	getAccountByIdAction: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}))

describe('Account Hooks', () => {
	let queryClient: QueryClient

	// Helper to create wrapper with React Query
	const createWrapper = () => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		})

		return ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('useAccountMutations', () => {
		it('should return mutation functions', () => {
			const { result } = renderHook(() => useAccountMutations(), {
				wrapper: createWrapper(),
			})

			expect(result.current).toHaveProperty('insertAccount')
			expect(result.current).toHaveProperty('updateAccount')
			expect(result.current).toHaveProperty('deleteAccount')

			// Verify they are functions
			expect(typeof result.current.insertAccount.mutate).toBe('function')
			expect(typeof result.current.updateAccount.mutate).toBe('function')
			expect(typeof result.current.deleteAccount.mutate).toBe('function')
		})

		it('should have correct initial state', () => {
			const { result } = renderHook(() => useAccountMutations(), {
				wrapper: createWrapper(),
			})

			expect(result.current.insertAccount.isPending).toBe(false)
			expect(result.current.updateAccount.isPending).toBe(false)
			expect(result.current.deleteAccount.isPending).toBe(false)

			expect(result.current.insertAccount.isError).toBe(false)
			expect(result.current.updateAccount.isError).toBe(false)
			expect(result.current.deleteAccount.isError).toBe(false)
		})
	})

	describe('useAccountsQuery', () => {
		it('should return query with correct initial state', () => {
			const { result } = renderHook(() => useAccountsQuery(), {
				wrapper: createWrapper(),
			})

			expect(result.current.isLoading).toBe(true)
			expect(result.current.isError).toBe(false)
			expect(result.current.data).toBeUndefined()
		})

		it('should be disabled when enabled is false', () => {
			const { result } = renderHook(
				() => useAccountsQuery({ enabled: false }),
				{
					wrapper: createWrapper(),
				},
			)

			expect(result.current.isLoading).toBe(false)
			expect(result.current.isFetching).toBe(false)
		})

		it('should use correct query key', () => {
			renderHook(() => useAccountsQuery(), {
				wrapper: createWrapper(),
			})

			// Verify the query was added with correct key
			const queries = queryClient.getQueryCache().getAll()
			expect(queries).toHaveLength(1)
			expect(queries[0].queryKey).toEqual(['accounts'])
		})
	})

	describe('Integration', () => {
		it('should handle mutation functions without throwing', () => {
			const { result } = renderHook(() => useAccountMutations(), {
				wrapper: createWrapper(),
			})

			// Test that mutation functions exist and can be called
			expect(() => {
				result.current.insertAccount.mutate({
					name: 'Test Account',
					email: 'test@example.com',
				})
			}).not.toThrow()

			expect(() => {
				result.current.updateAccount.mutate({
					id: 'test-id',
					name: 'Updated Account',
				})
			}).not.toThrow()

			expect(() => {
				result.current.deleteAccount.mutate({
					id: 'test-id',
				})
			}).not.toThrow()
		})
	})
})
