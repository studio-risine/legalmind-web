'use server'

import { createClient } from '@libs/supabase/server'
import type { AuthError, User } from '@supabase/supabase-js'

export interface UpdatePasswordInput {
	password: string
}

export interface UpdatePasswordOutput {
	user: User | null
	error: AuthError | null
}

export async function updatePassword(
	input: UpdatePasswordInput,
): Promise<UpdatePasswordOutput> {
	const supabase = await createClient()

	const {
		data: { user },
		error,
	} = await supabase.auth.updateUser({
		password: input.password,
	})

	if (error) {
		return {
			error,
			user: null,
		}
	}

	if (!user) {
		return {
			error,
			user: null,
		}
	}

	return {
		error: null,
		user,
	}
}
