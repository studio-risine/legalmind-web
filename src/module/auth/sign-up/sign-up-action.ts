'use server'

import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { type Either, left, right } from '@/utils/either'
import { type ActionError, createActionError } from '../shared/action-error'
import type { SignUpFormData } from './sign-up-form'

type SignUpSuccess = {
	user: User
}

export async function signUp(
	formData: SignUpFormData,
): Promise<Either<ActionError, SignUpSuccess>> {
	try {
		const supabase = await createClient()

		const { firstName, email, password } = formData

		const {
			data: { user },
			error,
		} = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					display_name: firstName,
				},
			},
		})

		if (error) {
			return left(
				createActionError(
					error.code ?? 'VALIDATION_ERROR',
					error.message,
					error.message.toLowerCase().includes('email') ? 'email' : 'password',
					error,
				),
			)
		}

		if (!user) {
			return left(
				createActionError(
					'VALIDATION_ERROR',
					'User not found',
					undefined,
					error,
				),
			)
		}

		return right({
			user,
		})
	} catch (error) {
		return left(
			createActionError(
				'SYSTEM_ERROR',
				'Internal server error',
				undefined,
				error,
			),
		)
	}
}
