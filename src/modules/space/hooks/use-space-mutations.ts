'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
	deleteSpaceAction,
	insertSpaceAction,
	updateSpaceAction,
} from '../actions'
import type { DeleteSpaceInput } from '../actions/delete-space-action'
import type { SpaceInsertInput } from '../actions/insert-space-action'
import type { SpaceUpdateInput } from '../actions/update-space-action'

// =====================
// Mutation: Insert
// =====================
export function useInsertSpace() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: SpaceInsertInput) => {
			const result = await insertSpaceAction(input)
			if (!result.success || !result.data) {
				throw new Error(result.error ?? 'Failed to create space')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['spaces'] })
			toast.success('Space created successfully')
		},
		onError: (error) => {
			console.error('Error creating space:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to create space',
			)
		},
	})
}

// =====================
// Mutation: Update
// =====================
export function useUpdateSpace() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: SpaceUpdateInput) => {
			const result = await updateSpaceAction(input)
			if (!result.success || !result.data) {
				throw new Error(result.error ?? 'Failed to update space')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['spaces'] })
			toast.success('Space updated successfully')
		},
		onError: (error) => {
			console.error('Error updating space:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to update space',
			)
		},
	})
}

// =====================
// Mutation: Delete
// =====================
export function useDeleteSpace() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: DeleteSpaceInput) => {
			const result = await deleteSpaceAction(input)
			if (!result.success) {
				throw new Error(result.error ?? 'Failed to delete space')
			}
			return true
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['spaces'] })
			toast.success('Space deleted successfully')
		},
		onError: (error) => {
			console.error('Error deleting space:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete space',
			)
		},
	})
}

// =====================
// Combined Hook
// =====================
export function useSpaceMutations() {
	const insertSpace = useInsertSpace()
	const updateSpace = useUpdateSpace()
	const deleteSpace = useDeleteSpace()

	return {
		insertSpace,
		updateSpace,
		deleteSpace,
	}
}
