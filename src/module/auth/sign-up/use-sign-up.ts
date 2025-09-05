'use client'

import type { User } from '@supabase/supabase-js'
import { useMutation } from '@tanstack/react-query'
import { useTransition } from 'react'
import { type Either, isLeft } from '@/utils/either'
import type { ActionError } from '../shared/action-error'
import type { SignUpFormData } from './sign-up-form'

type SignUpSuccess = {
	user: User
}

type UseSignUpOptions = {
	onSuccess?: () => void
	onError?: (error: ActionError) => void
}

export function useSignUp(
	action: (
		formData: SignUpFormData,
	) => Promise<Either<ActionError, SignUpSuccess>>,
	options?: UseSignUpOptions,
) {
	const [isPending, startTransition] = useTransition()

	const mutation = useMutation({
		mutationFn: async (formData: SignUpFormData) => {
			return new Promise((resolve, reject) => {
				startTransition(async () => {
					try {
						const result = await action(formData)

						if (isLeft(result)) {
							const actionError = result.left
							options?.onError?.(actionError)
							reject(actionError)
						} else {
							options?.onSuccess?.()
							resolve(result.right)
						}
					} catch (error) {
						const actionError: ActionError = {
							code: 'UNKNOWN_ERROR',
							message: 'Erro inesperado. Tente novamente.',
							originalError: error,
						}
						options?.onError?.(actionError)
						reject(actionError)
					}
				})
			})
		},
		retry: false,
	})

	return {
		execute: mutation.mutate,
		isPending: isPending || mutation.isPending,
		isError: mutation.isError,
		isSuccess: mutation.isSuccess,
		error: mutation.error as ActionError | null,
		data: mutation.data,
		reset: mutation.reset,
	}
}
