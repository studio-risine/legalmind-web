import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	useSpaceById,
	useSpaceQueries,
	useSpaceQuery,
	useSpacesList,
	useSpacesQuery,
} from '../use-space-queries'

// Mock the actions
vi.mock('@modules/space/actions', () => ({
	getSpaceByIdAction: vi.fn(),
	listSpacesAction: vi.fn(),
}))

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	})
	// biome-ignore lint/suspicious/noExplicitAny: Test wrapper needs any for children
	return ({ children }: any) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}

describe('Space Query Hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('useSpaceQuery', () => {
		it('should fetch space by ID successfully', async () => {
			// Arrange
			const { getSpaceByIdAction } = await import('@modules/space/actions')
			const mockSpace = {
				id: 'space-123',
				name: 'Test Space',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}

			vi.mocked(getSpaceByIdAction).mockResolvedValue(mockSpace)

			const { result } = renderHook(() => useSpaceQuery('space-123'), {
				wrapper: createWrapper(),
			})

			// Assert
			await waitFor(() => expect(result.current.isSuccess).toBe(true))
			expect(result.current.data).toEqual(mockSpace)
		})

		it('should handle space not found', async () => {
			// Arrange
			const { getSpaceByIdAction } = await import('@modules/space/actions')

			vi.mocked(getSpaceByIdAction).mockResolvedValue(null)

			const { result } = renderHook(() => useSpaceQuery('nonexistent'), {
				wrapper: createWrapper(),
			})

			// Assert
			await waitFor(() => expect(result.current.isError).toBe(true))
			expect(result.current.error?.message).toBe('Space not found')
		})

		it('should not fetch when disabled', async () => {
			// Arrange
			const { getSpaceByIdAction } = await import('@modules/space/actions')

			const { result } = renderHook(
				() => useSpaceQuery('space-123', { enabled: false }),
				{ wrapper: createWrapper() },
			)

			// Assert
			expect(result.current.isFetching).toBe(false)
			expect(vi.mocked(getSpaceByIdAction)).not.toHaveBeenCalled()
		})

		it('should not fetch when ID is empty', async () => {
			// Arrange
			const { getSpaceByIdAction } = await import('@modules/space/actions')

			const { result } = renderHook(() => useSpaceQuery(''), {
				wrapper: createWrapper(),
			})

			// Assert
			expect(result.current.isFetching).toBe(false)
			expect(vi.mocked(getSpaceByIdAction)).not.toHaveBeenCalled()
		})
	})

	describe('useSpaceById', () => {
		it('should provide convenient interface for space query', async () => {
			// Arrange
			const { getSpaceByIdAction } = await import('@modules/space/actions')
			const mockSpace = {
				id: 'space-123',
				name: 'Test Space',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}

			vi.mocked(getSpaceByIdAction).mockResolvedValue(mockSpace)

			const { result } = renderHook(() => useSpaceById('space-123'), {
				wrapper: createWrapper(),
			})

			// Assert
			await waitFor(() => expect(result.current.isLoading).toBe(false))
			expect(result.current.space).toEqual(mockSpace)
			expect(result.current.isError).toBe(false)
		})
	})

	describe('useSpacesQuery', () => {
		it('should fetch list of spaces successfully', async () => {
			// Arrange
			const { listSpacesAction } = await import('@modules/space/actions')
			const mockSpaces = [
				{
					id: 'space-1',
					name: 'Space One',
					created_at: new Date('2024-01-01'),
					updated_at: new Date('2024-01-01'),
					deleted_at: null,
				},
				{
					id: 'space-2',
					name: 'Space Two',
					created_at: new Date('2024-01-02'),
					updated_at: new Date('2024-01-02'),
					deleted_at: null,
				},
			]

			vi.mocked(listSpacesAction).mockResolvedValue(mockSpaces)

			const { result } = renderHook(() => useSpacesQuery(), {
				wrapper: createWrapper(),
			})

			// Assert
			await waitFor(() => expect(result.current.isSuccess).toBe(true))
			expect(result.current.data).toEqual(mockSpaces)
		})

		it('should handle empty spaces list', async () => {
			// Arrange
			const { listSpacesAction } = await import('@modules/space/actions')

			vi.mocked(listSpacesAction).mockResolvedValue([])

			const { result } = renderHook(() => useSpacesQuery(), {
				wrapper: createWrapper(),
			})

			// Assert
			await waitFor(() => expect(result.current.isSuccess).toBe(true))
			expect(result.current.data).toEqual([])
		})

		it('should handle null response from action', async () => {
			// Arrange
			const { listSpacesAction } = await import('@modules/space/actions')

			// biome-ignore lint/suspicious/noExplicitAny: Testing null response
			vi.mocked(listSpacesAction).mockResolvedValue(null as any)

			const { result } = renderHook(() => useSpacesQuery(), {
				wrapper: createWrapper(),
			})

			// Assert
			await waitFor(() => expect(result.current.isSuccess).toBe(true))
			expect(result.current.data).toEqual([])
		})
	})

	describe('useSpacesList', () => {
		it('should provide convenient interface with empty/has spaces flags', async () => {
			// Arrange
			const { listSpacesAction } = await import('@modules/space/actions')
			const mockSpaces = [
				{
					id: 'space-1',
					name: 'Space One',
					created_at: new Date(),
					updated_at: new Date(),
					deleted_at: null,
				},
			]

			vi.mocked(listSpacesAction).mockResolvedValue(mockSpaces)

			const { result } = renderHook(() => useSpacesList(), {
				wrapper: createWrapper(),
			})

			// Assert
			await waitFor(() => expect(result.current.isLoading).toBe(false))
			expect(result.current.spaces).toEqual(mockSpaces)
			expect(result.current.isEmpty).toBe(false)
			expect(result.current.hasSpaces).toBe(true)
		})

		it('should handle empty state correctly', async () => {
			// Arrange
			const { listSpacesAction } = await import('@modules/space/actions')

			vi.mocked(listSpacesAction).mockResolvedValue([])

			const { result } = renderHook(() => useSpacesList(), {
				wrapper: createWrapper(),
			})

			// Assert
			await waitFor(() => expect(result.current.isLoading).toBe(false))
			expect(result.current.spaces).toEqual([])
			expect(result.current.isEmpty).toBe(true)
			expect(result.current.hasSpaces).toBe(false)
		})
	})

	describe('useSpaceQueries', () => {
		it('should provide combined query interface', async () => {
			// Arrange
			const { getSpaceByIdAction, listSpacesAction } = await import(
				'@modules/space/actions'
			)
			const mockSpace = {
				id: 'space-123',
				name: 'Test Space',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			}
			const mockSpaces = [mockSpace]

			vi.mocked(getSpaceByIdAction).mockResolvedValue(mockSpace)
			vi.mocked(listSpacesAction).mockResolvedValue(mockSpaces)

			const { result } = renderHook(
				() => useSpaceQueries({ spaceId: 'space-123' }),
				{ wrapper: createWrapper() },
			)

			// Assert
			await waitFor(() => expect(result.current.isLoading).toBe(false))
			expect(result.current.space).toEqual(mockSpace)
			expect(result.current.spaces).toEqual(mockSpaces)
			expect(result.current.hasErrors).toBe(false)
		})

		it('should handle queries with different loading states', async () => {
			// Arrange
			const { getSpaceByIdAction, listSpacesAction } = await import(
				'@modules/space/actions'
			)

			// Space query succeeds, spaces query fails
			vi.mocked(getSpaceByIdAction).mockResolvedValue({
				id: 'space-123',
				name: 'Test Space',
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null,
			})
			vi.mocked(listSpacesAction).mockRejectedValue(new Error('Failed to load'))

			const { result } = renderHook(
				() => useSpaceQueries({ spaceId: 'space-123' }),
				{ wrapper: createWrapper() },
			)

			// Assert
			await waitFor(() => expect(result.current.hasErrors).toBe(true))
			expect(result.current.isSpaceError).toBe(false)
			expect(result.current.isSpacesError).toBe(true)
		})

		it('should not fetch space when no spaceId provided', async () => {
			// Arrange
			const { getSpaceByIdAction } = await import('@modules/space/actions')

			const { result } = renderHook(() => useSpaceQueries({}), {
				wrapper: createWrapper(),
			})

			// Assert
			expect(result.current.isSpaceLoading).toBe(false)
			expect(vi.mocked(getSpaceByIdAction)).not.toHaveBeenCalled()
		})
	})
})
