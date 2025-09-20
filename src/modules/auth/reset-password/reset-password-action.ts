'use server'

import { createClient } from '@libs/supabase/server'
import type { AuthError } from '@supabase/supabase-js'

export interface ResetPasswordServerInput {
	email: string
}

export interface ResetPasswordServerOutput {
	error: AuthError | null
}

export async function resetPasswordServer(
	input: ResetPasswordServerInput,
): Promise<ResetPasswordServerOutput> {
	const supabase = await createClient()

	const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
		redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/account/update-password`,
	})

	if (error) {
		return {
			error,
		}
	}

	return {
		error: null,
	}
}
