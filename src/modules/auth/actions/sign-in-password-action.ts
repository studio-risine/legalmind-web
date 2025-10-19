'use server'

import { createClient } from '@libs/supabase/server'
import type { AuthError, User } from '@supabase/supabase-js'

export interface AuthSignInPasswordInput {
	email: string
	password: string
}

export interface AuthSignInPasswordOutput {
	onSuccess: boolean
	user: User | null
	error?: AuthError
}

export async function signInWithPassword(
	input: AuthSignInPasswordInput,
): Promise<AuthSignInPasswordOutput> {
	const supabase = await createClient()

	const {
		data: { user },
		error,
	} = await supabase.auth.signInWithPassword(input)

	if (!user) {
		return {
			onSuccess: false,
			user: null,
			error: error as AuthError,
		}
	}

	if (error) {
		return {
			onSuccess: false,
			user: null,
			error: error as AuthError,
		}
	}

	return {
		onSuccess: true,
		user: user,
	}
}
