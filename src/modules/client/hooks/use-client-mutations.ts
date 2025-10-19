'use client'

import { PostgrestError } from '@supabase/supabase-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
	deleteClientAction,
	insertClientAction,
	toggleClientStatusAction,
	updateClientAction,
} from '../actions'
import type { DeleteClientOutput } from '../actions/delete-client-action'
import type { ClientInsertInput } from '../actions/insert-client-action'
import type {
	ToggleClientStatusInput,
	ToggleClientStatusOutput,
} from '../actions/toggle-client-status-action'
import type {
	ClientUpdateInput,
	UpdateClientOutput,
} from '../actions/update-client-action'

export function useClientMutation() {
	const queryClient = useQueryClient()

	// CREATE via server action
	const {
		mutateAsync: createClientAsync,
		mutate: createClient,
		...createRest
	} = useMutation({
		mutationFn: async (input: ClientInsertInput) => {
			try {
				const res = await insertClientAction(input)
				if (!res.success) {
					throw new Error(res.error ?? 'Failed to create Client')
				}
			} catch (error) {
				if (error instanceof PostgrestError) {
					throw error
				}

				throw new Error(
					error instanceof Error ? error.message : 'Failed to create Client',
				)
			}
		},

		onSuccess: () => {
			// Invalidate customers queries (consistent key naming)
			queryClient.invalidateQueries({ queryKey: ['customers'] })
			toast('Client created successfully.')
		},

		onError: (error) => {
			console.error('Error creating client:', error)
			toast('Failed to create Client.')
		},
	})

	// UPDATE via server action
	const {
		mutateAsync: updateClientAsync,
		mutate: updateClient,
		...updateRest
	} = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: Omit<ClientUpdateInput, 'id'>
		}) => updateClientAction({ id, ...data }),
		onSuccess: (result: UpdateClientOutput, variables) => {
			if (!result.success || !result.data) {
				toast.error(result.error ?? 'Failed to update client')
			} else {
				toast.success('Client updated successfully')
				// Optimized cache updates
				queryClient.setQueryData(
					['customers', 'byId', { id: variables.id }],
					result.data,
				)
				queryClient.invalidateQueries({ queryKey: ['customers'] })
			}
		},
		onError: (error) => {
			console.error('Error updating client:', error)
			toast.error('An unexpected error occurred')
		},
	})

	// DELETE via server action
	const {
		mutateAsync: deleteClientAsync,
		mutate: deleteClient,
		...deleteRest
	} = useMutation({
		mutationFn: (id: string) => deleteClientAction({ id }),
		onSuccess: (result: DeleteClientOutput, id) => {
			if (!result.success) {
				toast.error(result.error ?? 'Failed to delete client')
			} else {
				toast.success('Client deleted successfully')
				queryClient.removeQueries({ queryKey: ['customers', 'byId', { id }] })
				queryClient.invalidateQueries({ queryKey: ['customers'] })
			}
		},
		onError: (error) => {
			console.error('Error deleting client:', error)
			toast.error('An unexpected error occurred')
		},
	})

	const {
		mutateAsync: toggleClientStatusAsync,
		mutate: toggleClientStatus,
		...toggleRest
	} = useMutation({
		mutationFn: ({ id, status }: ToggleClientStatusInput) =>
			toggleClientStatusAction({ id, status }),
		onSuccess: (result: ToggleClientStatusOutput, variables) => {
			if (!result.success || !result.data) {
				toast.error(result.error ?? 'Failed to update client status')
			} else {
				toast.success('Client status updated successfully')
				queryClient.setQueryData(
					['customers', 'byId', { id: variables.id }],
					result.data,
				)
				queryClient.invalidateQueries({ queryKey: ['customers'] })
			}
		},
		onError: (error) => {
			console.error('Error toggling client status:', error)
			toast.error('An unexpected error occurred')
		},
	})

	return {
		// Create
		createClientAsync,
		createClient,

		// Update
		updateClientAsync,
		updateClient,

		// Delete
		deleteClientAsync,
		deleteClient,

		// Toggle status
		toggleClientStatusAsync,
		toggleClientStatus,

		// Combined states
		isLoading:
			createRest.isPending ||
			updateRest.isPending ||
			deleteRest.isPending ||
			toggleRest.isPending,
		isCreating: createRest.isPending,
		isUpdating: updateRest.isPending,
		isDeleting: deleteRest.isPending,
		isTogglingStatus: toggleRest.isPending,
	}
}
