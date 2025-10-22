import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	useDeleteSpace,
	useInsertSpace,
	useSpaceMutations,
	useUpdateSpace,
} from '../use-space-mutations'

// Mock the actions
vi.mock('@modules/space/actions', () => ({
	insertSpaceAction: vi.fn(),
	updateSpaceAction: vi.fn(),
	deleteSpaceAction: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}))

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	})
	// biome-ignore lint/suspicious/noExplicitAny: Test wrapper needs any for children
	return ({ children }: any) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}

describe('Space Mutation Hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('useInsertSpace', () => {
		it('should create space successfully and show success toast', async () => {
			// Arrange
			const { insertSpaceAction } = await import('@modules/space/actions')
			const { toast } = await import('sonner')

			vi.mocked(insertSpaceAction).mockResolvedValue({
				success: true,
				data: {
					id: 'space-123',
					name: 'Test Space',
					created_at: new Date(),
					updated_at: new Date(),
					deleted_at: null,
				},
			})

			const { result } = renderHook(() => useInsertSpace(), {
				wrapper: createWrapper(),
			})

			// Act
			result.current.mutate({ name: 'Test Space' })

			// Assert
			await waitFor(() => expect(result.current.isSuccess).toBe(true))
			expect(toast.success).toHaveBeenCalledWith('Space created successfully')
			expect(result.current.data).toEqual({
				id: 'space-123',
				name: 'Test Space',
				created_at: expect.any(Date),
				updated_at: expect.any(Date),
				deleted_at: null,
			})
		})

		it('should handle creation failure and show error toast', async () => {
			// Arrange
			const { insertSpaceAction } = await import('@modules/space/actions')
			const { toast } = await import('sonner')

			vi.mocked(insertSpaceAction).mockResolvedValue({
				success: false,
				error: 'Validation failed',
			})

			const { result } = renderHook(() => useInsertSpace(), {
				wrapper: createWrapper(),
			})

			// Act
			result.current.mutate({ name: '' })

			// Assert
			await waitFor(() => expect(result.current.isError).toBe(true))
			expect(toast.error).toHaveBeenCalledWith('Validation failed')
		})
	})

	describe('useUpdateSpace', () => {
		it('should update space successfully and show success toast', async () => {
			// Arrange
			const { updateSpaceAction } = await import('@modules/space/actions')
			const { toast } = await import('sonner')

			vi.mocked(updateSpaceAction).mockResolvedValue({
				success: true,
				data: {
					id: 'space-123',
					name: 'Updated Space',
					created_at: new Date('2024-01-01'),
					updated_at: new Date(),
					deleted_at: null,
				},
			})

			const { result } = renderHook(() => useUpdateSpace(), {
				wrapper: createWrapper(),
			})

			// Act
			result.current.mutate({ id: 'space-123', name: 'Updated Space' })

			// Assert
			await waitFor(() => expect(result.current.isSuccess).toBe(true))
			expect(toast.success).toHaveBeenCalledWith('Space updated successfully')
		})

		it('should handle update failure and show error toast', async () => {
			// Arrange
			const { updateSpaceAction } = await import('@modules/space/actions')
			const { toast } = await import('sonner')

			vi.mocked(updateSpaceAction).mockResolvedValue({
				success: false,
				error: 'Space not found',
			})

			const { result } = renderHook(() => useUpdateSpace(), {
				wrapper: createWrapper(),
			})

			// Act
			result.current.mutate({ id: 'nonexistent', name: 'Updated Space' })

			// Assert
			await waitFor(() => expect(result.current.isError).toBe(true))
			expect(toast.error).toHaveBeenCalledWith('Space not found')
		})
	})

	describe('useDeleteSpace', () => {
		it('should delete space successfully and show success toast', async () => {
			// Arrange
			const { deleteSpaceAction } = await import('@modules/space/actions')
			const { toast } = await import('sonner')

			vi.mocked(deleteSpaceAction).mockResolvedValue({
				success: true,
			})

			const { result } = renderHook(() => useDeleteSpace(), {
				wrapper: createWrapper(),
			})

			// Act
			result.current.mutate({ id: 'space-123' })

			// Assert
			await waitFor(() => expect(result.current.isSuccess).toBe(true))
			expect(toast.success).toHaveBeenCalledWith('Space deleted successfully')
		})

		it('should handle deletion failure and show error toast', async () => {
			// Arrange
			const { deleteSpaceAction } = await import('@modules/space/actions')
			const { toast } = await import('sonner')

			vi.mocked(deleteSpaceAction).mockResolvedValue({
				success: false,
				error: 'Access denied',
			})

			const { result } = renderHook(() => useDeleteSpace(), {
				wrapper: createWrapper(),
			})

			// Act
			result.current.mutate({ id: 'space-123' })

			// Assert
			await waitFor(() => expect(result.current.isError).toBe(true))
			expect(toast.error).toHaveBeenCalledWith('Access denied')
		})
	})

	describe('useSpaceMutations', () => {
		it('should provide all mutation functions', () => {
			// Arrange & Act
			const { result } = renderHook(() => useSpaceMutations(), {
				wrapper: createWrapper(),
			})

			// Assert
			expect(result.current.insertSpace).toBeDefined()
			expect(result.current.updateSpace).toBeDefined()
			expect(result.current.deleteSpace).toBeDefined()
			expect(typeof result.current.insertSpace.mutate).toBe('function')
			expect(typeof result.current.updateSpace.mutate).toBe('function')
			expect(typeof result.current.deleteSpace.mutate).toBe('function')
		})

		it('should provide access to all mutation states', async () => {
			// Arrange
			const { insertSpaceAction } = await import('@modules/space/actions')

			vi.mocked(insertSpaceAction).mockResolvedValue({
				success: true,
				data: {
					id: 'space-123',
					name: 'Test Space',
					created_at: new Date(),
					updated_at: new Date(),
					deleted_at: null,
				},
			})

			const { result } = renderHook(() => useSpaceMutations(), {
				wrapper: createWrapper(),
			})

			// Act
			result.current.insertSpace.mutate({ name: 'Test Space' })

			// Assert
			await waitFor(() =>
				expect(result.current.insertSpace.isSuccess).toBe(true),
			)
			expect(result.current.insertSpace.data).toBeDefined()
		})

		it('should handle all mutation error states', async () => {
			// Arrange
			const { insertSpaceAction } = await import('@modules/space/actions')

			vi.mocked(insertSpaceAction).mockResolvedValue({
				success: false,
				error: 'Failed to create',
			})

			const { result } = renderHook(() => useSpaceMutations(), {
				wrapper: createWrapper(),
			})

			// Act
			result.current.insertSpace.mutate({ name: 'Test Space' })

			// Assert
			await waitFor(() => expect(result.current.insertSpace.isError).toBe(true))
			expect(result.current.insertSpace.error).toBeDefined()
		})
	})
})
