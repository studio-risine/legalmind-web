'use server'

import { createClient } from '@libs/supabase/server'
import { emailSchema, passwordSchema } from '@libs/zod/schemas/defaults'
import { AuthError } from '@supabase/supabase-js'
import z, { type ZodError } from 'zod'

const signInSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
})

type SignInInput = z.infer<typeof signInSchema>

export interface SignInOutput {
	data: string | null
	success: boolean
	message?: string | null
	errors?: ZodError | AuthError | null
}

export async function signInWithPassword(
	data: SignInInput,
): Promise<SignInOutput> {
	const parsed = signInSchema.safeParse(data)

	if (!parsed.success) {
		return {
			success: false,
			message: parsed.error.message,
			data: null,
			errors: parsed.error,
		}
	}

	try {
		const supabase = await createClient()

		const {
			data: { user },
			error,
		} = await supabase.auth.signInWithPassword({
			email: parsed.data.email,
			password: parsed.data.password,
		})

		if (!user) {
			return {
				data: null,
				success: false,
				message: error?.message || 'Sign in failed',
				errors: error,
			}
		}

		return {
			success: true,
			data: user.id,
		}
	} catch (error) {
		if (error instanceof AuthError) {
			return {
				data: null,
				success: false,
				message: error.message,
				errors: error,
			}
		}

		console.error(error)

		return {
			data: null,
			success: false,
			message: 'Unknown error occurred',
			errors: null,
		}
	}
}
