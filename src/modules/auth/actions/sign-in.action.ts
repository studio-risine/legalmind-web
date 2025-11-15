'use server'

import { createClient } from '@libs/supabase/server'
import { emailSchemaDefault, passwordSchema } from '@libs/zod/schemas/defaults'
import { AuthError } from '@supabase/supabase-js'
import z, { type ZodError } from 'zod'

const signInSchema = z.object({
	email: emailSchemaDefault,
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
			data: null,
			errors: parsed.error,
			message: parsed.error.message,
			success: false,
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
				errors: error,
				message: error?.message || 'Sign in failed',
				success: false,
			}
		}

		return {
			data: user.id,
			success: true,
		}
	} catch (error) {
		if (error instanceof AuthError) {
			return {
				data: null,
				errors: error,
				message: error.message,
				success: false,
			}
		}

		console.error(error)

		return {
			data: null,
			errors: null,
			message: 'Unknown error occurred',
			success: false,
		}
	}
}
