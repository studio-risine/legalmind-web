'use server'

import type { AuthError, User } from '@supabase/supabase-js'
import { createClient } from '@/libs/supabase/server'

export interface AuthSignUpInput {
	firstName: string
	lastName?: string
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
			emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard`,
			data: {
				display_name: input.firstName,
				first_name: input.firstName,
				last_name: input.lastName,
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
