'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
	deleteAccountAction,
	insertAccountAction,
	updateAccountAction,
} from '../actions'
import type { DeleteAccountInput } from '../actions/delete-account-action'
import type { AccountInsertInput } from '../actions/insert-account-action'
import type { AccountUpdateInput } from '../actions/update-account-action'

// =====================
// Mutation: Insert
// =====================
export function useInsertAccount() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: AccountInsertInput) => {
			const result = await insertAccountAction(input)
			if (!result.success || !result.data) {
				throw new Error(result.error ?? 'Failed to create account')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['accounts'] })
			toast.success('Account created successfully')
		},
		onError: (error) => {
			console.error('Error creating account:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to create account',
			)
		},
	})
}

// =====================
// Mutation: Update
// =====================
export function useUpdateAccount() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: AccountUpdateInput) => {
			const result = await updateAccountAction(input)
			if (!result.success || !result.data) {
				throw new Error(result.error ?? 'Failed to update account')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['accounts'] })
			toast.success('Account updated successfully')
		},
		onError: (error) => {
			console.error('Error updating account:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to update account',
			)
		},
	})
}

// =====================
// Mutation: Delete
// =====================
export function useDeleteAccount() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (input: DeleteAccountInput) => {
			const result = await deleteAccountAction(input)
			if (!result.success) {
				throw new Error(result.error ?? 'Failed to delete account')
			}
			return true
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['accounts'] })
			toast.success('Account deleted successfully')
		},
		onError: (error) => {
			console.error('Error deleting account:', error)
			toast.error(
				error instanceof Error ? error.message : 'Failed to delete account',
			)
		},
	})
}

// =====================
// Combined Hook
// =====================
export function useAccountMutations() {
	const insertAccount = useInsertAccount()
	const updateAccount = useUpdateAccount()
	const deleteAccount = useDeleteAccount()

	return {
		insertAccount,
		updateAccount,
		deleteAccount,
	}
}
