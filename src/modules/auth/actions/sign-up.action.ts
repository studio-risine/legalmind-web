'use server'

import { env } from '@infra/env'
import { createClient } from '@libs/supabase/server'
import { emailSchema, passwordSchema } from '@libs/zod/schemas/defaults'
import { AuthError } from '@supabase/supabase-js'
import z, { type ZodError } from 'zod'

const signUpSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
})

type SignUpInput = z.infer<typeof signUpSchema>

export interface SignUpOutput {
	data: string | null
	success: boolean
	message?: string | null
	errors?: ZodError | AuthError | null
}

export async function signUpWithEmail(
	data: SignUpInput,
): Promise<SignUpOutput> {
	const parsed = signUpSchema.safeParse(data)

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
		} = await supabase.auth.signUp({
			email: parsed.data.email,
			password: parsed.data.password,
			options: {
				emailRedirectTo: `${env.DATABASE_URL}/space/onboarding`,
			},
		})

		if (!user) {
			return {
				data: null,
				success: false,
				message: error?.message || 'Sign up failed',
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
