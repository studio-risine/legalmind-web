'use server'

import { makeSupabaseServerClient } from '@modules/auth/factories'
import { AuthError, type User } from '@supabase/supabase-js'
import { cache } from 'react'
import type { ZodError } from 'zod'

interface UserAuthActionOutput {
	data: User | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

export const userAuthAction = cache(async (): Promise<UserAuthActionOutput> => {
	try {
		const supabase = await makeSupabaseServerClient()

		const {
			data: { user },
			error,
		} = await supabase.auth.getUser()

		if (!user) {
			return {
				data: null,
				success: false,
				message: error?.message || 'User not authenticated',
				error: error,
			}
		}

		if (error) {
			return {
				data: null,
				success: false,
				message: error?.message || 'User not authenticated',
				error: error,
			}
		}

		return {
			success: true,
			data: user,
		}
	} catch (error) {
		if (error instanceof AuthError) {
			return {
				data: null,
				success: false,
				message: error?.message || 'User not authenticated',
				error,
			}
		}

		console.error(error)

		return {
			data: null,
			success: false,
			message: 'Unknown error occurred',
			error: null,
		}
	}
})
