'use server'

import { env } from '@infra/env'
import { createClient } from '@libs/supabase/server'
import { emailSchemaDefault, passwordSchema } from '@libs/zod/schemas/defaults'
import { AuthError } from '@supabase/supabase-js'
import z, { type ZodError } from 'zod'

const signUpSchema = z.object({
	email: emailSchemaDefault,
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
		} = await supabase.auth.signUp({
			email: parsed.data.email,
			options: {
				emailRedirectTo: `${env.DATABASE_URL}/space/onboarding`,
			},
			password: parsed.data.password,
		})

		if (!user) {
			return {
				data: null,
				errors: error,
				message: error?.message || 'Sign up failed',
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
