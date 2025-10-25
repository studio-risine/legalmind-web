'use client'

import type { Account } from '@infra/db/schemas/accounts'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { getAccountByIdAction } from '../actions/get-account-by-id-action'
import { listAccountsAction } from '../actions/list-accounts-action'

// =====================
// Query: by ID
// =====================
export interface UseAccountQueryOptions {
	enabled?: boolean
	staleTime?: number
	refetchOnWindowFocus?: boolean
	queryOptions?: Omit<
		UseQueryOptions<Account, Error, Account, [string, string, { id: string }]>,
		'enabled' | 'staleTime' | 'refetchOnWindowFocus' | 'queryKey' | 'queryFn'
	>
}

export function useAccountQuery(
	id: string,
	options: UseAccountQueryOptions = {},
) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000,
		refetchOnWindowFocus = false,
		queryOptions,
	} = options

	return useQuery<Account, Error, Account, [string, string, { id: string }]>({
		queryKey: ['accounts', 'byId', { id }],
		queryFn: async () => {
			const result = await getAccountByIdAction({ id })
			if (!result.success || !result.data) {
				throw new Error(result.error ?? 'Account not found')
			}
			return result.data
		},
		enabled: enabled && !!id,
		staleTime,
		refetchOnWindowFocus,
		...queryOptions,
	})
}

// =====================
// Query: List All
// =====================
export interface UseAccountsQueryOptions {
	enabled?: boolean
	staleTime?: number
	refetchOnWindowFocus?: boolean
	queryOptions?: Omit<
		UseQueryOptions<Account[], Error, Account[], [string]>,
		'enabled' | 'staleTime' | 'refetchOnWindowFocus' | 'queryKey' | 'queryFn'
	>
}

export function useAccountsQuery(options: UseAccountsQueryOptions = {}) {
	const {
		enabled = true,
		staleTime = 5 * 60 * 1000,
		refetchOnWindowFocus = false,
		queryOptions,
	} = options

	return useQuery<Account[], Error, Account[], [string]>({
		queryKey: ['accounts'],
		queryFn: async () => {
			const accounts = await listAccountsAction()
			return accounts
		},
		enabled,
		staleTime,
		refetchOnWindowFocus,
		...queryOptions,
	})
}

// =====================
// Combined Hook
// =====================
export function useAccountQueries() {
	return {
		useAccountQuery,
		useAccountsQuery,
	}
}
