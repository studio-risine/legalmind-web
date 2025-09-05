'use server'

import { createClient } from '@/lib/supabase/server'
import { type Either, left, right } from '@/utils/either'
import { type ActionError, createActionError } from '../shared/action-error'
import type { SignInFormData } from './sign-in-form'

type SignInSuccess = {
	user: {
		id: string
		email: string
		displayName?: string
	}
}

export async function signIn(
	formData: SignInFormData,
): Promise<Either<ActionError, SignInSuccess>> {
	try {
		const supabase = await createClient()

		const { email, password } = formData

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			return left(
				createActionError(
					error.code ?? 'AUTHENTICATION_FAILED',
					error.message,
					error.message.toLowerCase().includes('email') ? 'email' : 'password',
					error,
				),
			)
		}

		if (!data.user) {
			return left(
				createActionError('USER_NOT_FOUND', 'Usuário não encontrado', 'email'),
			)
		}

		const result = right({
			user: {
				id: data.user.id,
				email: data.user.email || '',
				displayName: data.user.user_metadata?.display_name,
			},
		})

		return result
	} catch (error) {
		return left(
			createActionError(
				'SYSTEM_ERROR',
				'Erro interno do sistema. Tente novamente.',
				undefined,
				error,
			),
		)
	}
}
