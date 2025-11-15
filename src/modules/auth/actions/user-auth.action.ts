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
				error: error,
				message: error?.message || 'User not authenticated',
				success: false,
			}
		}

		if (error) {
			return {
				data: null,
				error: error,
				message: error?.message || 'User not authenticated',
				success: false,
			}
		}

		return {
			data: user,
			success: true,
		}
	} catch (error) {
		if (error instanceof AuthError) {
			return {
				data: null,
				error,
				message: error?.message || 'User not authenticated',
				success: false,
			}
		}

		console.error(error)

		return {
			data: null,
			error: null,
			message: 'Unknown error occurred',
			success: false,
		}
	}
})
