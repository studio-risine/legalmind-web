'use client'

import {
	deleteProcessAction,
	insertProcessAction,
	updateProcessAction,
} from '@modules/process/actions'
import type { ProcessInsertInput } from '@modules/process/actions/insert-process-action'
import type { ProcessUpdateInput } from '@modules/process/actions/update-process-action'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// =====================
// Mutation: Insert
// =====================
export function useInsertProcess() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: ProcessInsertInput) => {
			const result = await insertProcessAction(input)
			if (!result.success || !result.data) {
				throw new Error(result.error ?? 'Failed to create process')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['processes'] })
			toast.success('Process created successfully')
		},
		onError: (error) => {
			console.error('Error creating process:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to create process',
			)
		},
	})
}

// =====================
// Mutation: Update
// =====================
export function useUpdateProcess() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: ProcessUpdateInput) => {
			const result = await updateProcessAction(input)
			if (!result.success || !result.data) {
				throw new Error(result.error ?? 'Failed to update process')
			}
			return { id: input.id, data: result.data }
		},
		onSuccess: ({ id, data }) => {
			queryClient.setQueryData(['processes', 'byId', { id }], data)
			queryClient.invalidateQueries({ queryKey: ['processes', 'list'] })
			queryClient.invalidateQueries({ queryKey: ['processes', 'search'] })
			toast.success('Process updated successfully')
		},
		onError: (error) => {
			console.error('Error updating process:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to update process',
			)
		},
	})
}

// =====================
// Mutation: Delete
// =====================
export function useDeleteProcess() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const result = await deleteProcessAction({ id })
			if (result.error) {
				throw new Error(result.error)
			}
			return id
		},
		onSuccess: (id) => {
			queryClient.removeQueries({ queryKey: ['processes', 'byId', { id }] })
			queryClient.invalidateQueries({ queryKey: ['processes', 'list'] })
			queryClient.invalidateQueries({ queryKey: ['processes', 'search'] })
			toast.success('Process deleted successfully')
		},
		onError: (error) => {
			console.error('Error deleting process:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete process',
			)
		},
	})
}

// =====================
// Combined Hook
// =====================
export function useProcessMutation() {
	const insertMutation = useInsertProcess()
	const updateMutation = useUpdateProcess()
	const deleteMutation = useDeleteProcess()

	return {
		// Insert
		insertProcess: insertMutation.mutate,
		insertProcessAsync: insertMutation.mutateAsync,
		isInserting: insertMutation.isPending,

		// Update
		updateProcess: updateMutation.mutate,
		updateProcessAsync: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,

		// Delete
		deleteProcess: deleteMutation.mutate,
		deleteProcessAsync: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,

		// Combined states
		isLoading:
			insertMutation.isPending ||
			updateMutation.isPending ||
			deleteMutation.isPending,
	}
}
