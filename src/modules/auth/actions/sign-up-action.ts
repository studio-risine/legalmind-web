'use server'
import { createClient } from '@libs/supabase/server'
import {
	createAccountAction,
	type InsertAccountInput,
} from '@modules/account/actions/mutations/create-account.action'
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
			emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/space`,
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

	const insertAccount: InsertAccountInput = {
		userId: user.id,
		displayName: user.user_metadata.display_name,
		email: user.email ?? '',
	}

	await createAccountAction(insertAccount)

	return {
		user,
		error: null,
	}
}
