'use client'

import { useMutation } from '@tanstack/react-query'
import { useTransition } from 'react'
import type { ActionError } from '@/module/auth/shared/action-error'
import { type Either, isLeft } from '@/utils/either'
import type { SignInFormData } from './sign-in-form'

type SignInSuccess = {
	user: {
		id: string
		email: string
		displayName?: string
	}
}

type UseSignInOptions = {
	onSuccess?: () => void
	onError?: (error: ActionError) => void
}

export function useSignIn(
	action: (
		formData: SignInFormData,
	) => Promise<Either<ActionError, SignInSuccess>>,
	options?: UseSignInOptions,
) {
	const [isPending, startTransition] = useTransition()

	const mutation = useMutation({
		mutationFn: async (formData: SignInFormData) => {
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
