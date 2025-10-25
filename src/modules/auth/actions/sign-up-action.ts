'use server'

import { PRIVATE_PATH_ROOT } from '@config/routes'
import { createClient } from '@libs/supabase/server'
import type { AuthError, User } from '@supabase/supabase-js'

export interface AuthSignUpInput {
	displayName: string
	email: string
	password: string
}

export interface AuthSignUpOutput {
	user: User | null
	error: AuthError | null
}

export async function signUpWithEmail(
	input: AuthSignUpInput,
): Promise<AuthSignUpOutput> {
	const supabase = await createClient()

	const {
		data: { user },
		error,
	} = await supabase.auth.signUp({
		email: input.email,
		password: input.password,
		options: {
			emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${PRIVATE_PATH_ROOT}`,
			data: {
				display_name: input.displayName,
			},
		},
	})

	if (error) {
		return {
			user: null,
			error,
		}
	}

	if (!user) {
		return {
			user: null,
			error,
		}
	}

	return {
		user,
		error: null,
	}
}
