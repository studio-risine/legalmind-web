import type { Process } from '@infra/db/schemas/processes'
import {
	getProcessByIdAction,
	getProcessesAction,
	searchProcessesAction,
} from '@modules/process/actions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	useProcessesList,
	useProcessPagination,
	useProcessQuery,
	useProcessSearchWithDebounce,
} from '../use-process-queries'

vi.mock('@modules/process/actions', () => ({
	getProcessByIdAction: vi.fn(),
	getProcessesAction: vi.fn(),
	searchProcessesAction: vi.fn(),
}))

vi.mock('@hooks/use-debounced-callback', () => ({
	useDebouncedCallback: vi.fn((callback) => callback),
}))

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
				staleTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	})

	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}

const mockProcess: Process = {
	id: 'process-1',
	account_id: 1,
	client_id: 'client-1',
	cnj: '1234567-89.2024.8.26.0100',
	court: 'TJSP',
	title: 'Test Process',
	status: 'ACTIVE',
	tags: ['important'],
	archived_at: null,
	deleted_at: null,
	created_at: new Date('2024-01-01'),
	updated_at: null,
}

const mockProcesses: Process[] = [
	mockProcess,
	{
		...mockProcess,
		id: 'process-2',
		title: 'Second Process',
	},
	{
		...mockProcess,
		id: 'process-3',
		title: 'Third Process',
		status: 'INACTIVE',
	},
]

describe('useProcessQuery', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should fetch a process by ID successfully', async () => {
		vi.mocked(getProcessByIdAction).mockResolvedValue(mockProcess)

		const { result } = renderHook(() => useProcessQuery('process-1'), {
			wrapper: createWrapper(),
		})

		expect(result.current.isLoading).toBe(true)

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true)
		})

		expect(result.current.data).toEqual(mockProcess)
		expect(getProcessByIdAction).toHaveBeenCalledWith({ id: 'process-1' })
	})

	it('should return an error when the process is not found', async () => {
		vi.mocked(getProcessByIdAction).mockResolvedValue(null)

		const { result } = renderHook(() => useProcessQuery('process-999'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isError).toBe(true)
		})

		expect(result.current.error).toBeDefined()
		expect(result.current.error?.message).toBe('Process not found')
	})

	it('should respect the enabled: false option and not make the call', async () => {
		vi.mocked(getProcessByIdAction).mockResolvedValue(mockProcess)

		const { result } = renderHook(
			() => useProcessQuery('process-1', { enabled: false }),
			{
				wrapper: createWrapper(),
			},
		)

		expect(result.current.isFetching).toBe(false)
		expect(getProcessByIdAction).not.toHaveBeenCalled()
	})
})

describe('useProcessesList', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should list processes with default pagination parameters', async () => {
		vi.mocked(getProcessesAction).mockResolvedValue({
			data: mockProcesses,
			total: 3,
		})

		const { result } = renderHook(() => useProcessesList(), {
			wrapper: createWrapper(),
		})

		expect(result.current.isLoading).toBe(true)

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true)
		})

		expect(result.current.data).toEqual({
			processes: mockProcesses,
			total: 3,
		})

		expect(getProcessesAction).toHaveBeenCalledWith({
			searchQuery: undefined,
			status: undefined,
			sortBy: undefined,
			sortDirection: undefined,
			page: 1,
			perPage: 50,
		})
	})

	it('should filter the list by status', async () => {
		const activeProcesses = mockProcesses.filter((p) => p.status === 'ACTIVE')

		vi.mocked(getProcessesAction).mockResolvedValue({
			data: activeProcesses,
			total: 2,
		})

		const { result } = renderHook(
			() => useProcessesList({ status: 'ACTIVE' }),
			{
				wrapper: createWrapper(),
			},
		)

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true)
		})

		expect(result.current.data).toEqual({
			processes: activeProcesses,
			total: 2,
		})

		expect(getProcessesAction).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 'ACTIVE',
			}),
		)
	})

	it('should apply searchQuery to filter the results', async () => {
		const filteredProcesses = mockProcesses.filter((p) =>
			p.title?.includes('Test'),
		)

		vi.mocked(getProcessesAction).mockResolvedValue({
			data: filteredProcesses,
			total: 1,
		})

		const { result } = renderHook(() => useProcessesList({ search: 'Test' }), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true)
		})

		expect(result.current.data).toEqual({
			processes: filteredProcesses,
			total: 1,
		})

		expect(getProcessesAction).toHaveBeenCalledWith(
			expect.objectContaining({
				searchQuery: 'Test',
			}),
		)
	})
})

describe('useProcessSearchWithDebounce', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should apply debounce when changing the search query', async () => {
		vi.mocked(searchProcessesAction).mockResolvedValue({
			processes: mockProcesses,
			total: 3,
			hasMore: false,
		})

		const { result } = renderHook(() => useProcessSearchWithDebounce(), {
			wrapper: createWrapper(),
		})

		// Change the query
		act(() => {
			result.current.handleQueryChange('Test')
		})

		await waitFor(() => {
			expect(result.current.query).toBe('Test')
		})
	})

	it('should not search if the query has less than 2 characters', async () => {
		vi.mocked(searchProcessesAction).mockResolvedValue({
			processes: [],
			total: 0,
			hasMore: false,
		})

		const { result } = renderHook(() => useProcessSearchWithDebounce(), {
			wrapper: createWrapper(),
		})

		act(() => {
			result.current.handleQueryChange('T')
		})

		await waitFor(() => {
			expect(result.current.query).toBe('')
		})

		expect(searchProcessesAction).not.toHaveBeenCalled()
	})

	it('should change the status filter immediately (without debounce)', async () => {
		vi.mocked(searchProcessesAction).mockResolvedValue({
			processes: mockProcesses,
			total: 3,
			hasMore: false,
		})

		const { result } = renderHook(() => useProcessSearchWithDebounce(), {
			wrapper: createWrapper(),
		})

		act(() => {
			result.current.handleStatusChange('ACTIVE')
		})

		await waitFor(() => {
			expect(result.current.status).toBe('ACTIVE')
		})
	})

	it('should clear all filters with clearFilters', async () => {
		const { result } = renderHook(
			() =>
				useProcessSearchWithDebounce({
					initialQuery: 'Test',
					initialStatus: 'ACTIVE',
				}),
			{
				wrapper: createWrapper(),
			},
		)

		act(() => {
			result.current.clearFilters()
		})

		await waitFor(() => {
			expect(result.current.query).toBe('')
			expect(result.current.status).toBeUndefined()
		})
	})
})

describe('useProcessPagination', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should start on page 1 and calculate totalPages correctly', async () => {
		vi.mocked(getProcessesAction).mockResolvedValue({
			data: mockProcesses.slice(0, 2),
			total: 50,
		})

		const { result } = renderHook(
			() => useProcessPagination({ pageSize: 20 }),
			{
				wrapper: createWrapper(),
			},
		)

		await waitFor(() => {
			expect(result.current.currentPage).toBe(1)
			expect(result.current.totalPages).toBe(3) // 50 / 20 = 2.5 -> 3 pages
		})
	})

	it('should navigate to the next page with goToNextPage', async () => {
		vi.mocked(getProcessesAction).mockResolvedValue({
			data: mockProcesses,
			total: 100, // 100 / 20 = 5 pages, ensuring there is a next page
		})

		const { result } = renderHook(
			() => useProcessPagination({ pageSize: 20 }),
			{
				wrapper: createWrapper(),
			},
		)

		// Wait for the initial query to complete and hasNextPage to be calculated
		await waitFor(() => {
			expect(result.current.hasNextPage).toBe(true)
		})

		expect(result.current.currentPage).toBe(1)
		expect(result.current.totalPages).toBe(5)

		act(() => {
			result.current.goToNextPage()
		})

		// Wait for the new query to complete after changing the page
		await waitFor(() => {
			expect(result.current.currentPage).toBe(2)
			expect(result.current.totalPages).toBe(5)
		})

		expect(result.current.hasPreviousPage).toBe(true)
	})

	it('should navigate to the previous page with goToPreviousPage', async () => {
		vi.mocked(getProcessesAction).mockResolvedValue({
			data: mockProcesses,
			total: 50,
		})

		const { result } = renderHook(
			() => useProcessPagination({ pageSize: 20 }),
			{
				wrapper: createWrapper(),
			},
		)

		// Wait for the initial query to complete
		await waitFor(() => {
			expect(result.current.hasNextPage).toBe(true)
		})

		expect(result.current.currentPage).toBe(1)

		// Go to page 2 first
		act(() => {
			result.current.goToNextPage()
		})

		expect(result.current.currentPage).toBe(2)

		// Go back to page 1
		act(() => {
			result.current.goToPreviousPage()
		})

		expect(result.current.currentPage).toBe(1)
		expect(result.current.hasPreviousPage).toBe(false)
	})

	it('should go to a specific page with goToPage', async () => {
		vi.mocked(getProcessesAction).mockResolvedValue({
			data: mockProcesses,
			total: 100,
		})

		const { result } = renderHook(
			() => useProcessPagination({ pageSize: 20 }),
			{
				wrapper: createWrapper(),
			},
		)

		// Wait for totalPages to be calculated (100 / 20 = 5 pages)
		await waitFor(() => {
			expect(result.current.totalPages).toBe(5)
		})

		expect(result.current.currentPage).toBe(1)

		act(() => {
			result.current.goToPage(3)
		})

		expect(result.current.currentPage).toBe(3)
	})

	it('should disable hasNextPage and hasPreviousPage at the limits', async () => {
		vi.mocked(getProcessesAction).mockResolvedValue({
			data: mockProcesses,
			total: 20,
		})

		const { result } = renderHook(
			() => useProcessPagination({ pageSize: 20 }),
			{
				wrapper: createWrapper(),
			},
		)

		await waitFor(() => {
			expect(result.current.currentPage).toBe(1)
			expect(result.current.totalPages).toBe(1)
		})

		// On the first and only page
		expect(result.current.hasNextPage).toBe(false)
		expect(result.current.hasPreviousPage).toBe(false)
	})
})
