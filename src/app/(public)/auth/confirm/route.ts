import { createClient } from '@libs/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const token_hash = searchParams.get('token_hash')
	const type = searchParams.get('type') as EmailOtpType | null
	const next = searchParams.get('next') ?? '/dashboard'

	if (!token_hash || !type) {
		console.error('Missing token_hash or type parameter')
		return redirect('/auth/error?message=invalid_request')
	}

	try {
		const supabase = await createClient()
		const { data, error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		})

		if (error) {
			console.error('OTP verification failed:', error.message)
			return redirect('/auth/error?message=verification_failed')
		}

		if (data.user) {
			console.log('User confirmed successfully:', data.user.email)
			return redirect(next)
		}

		return redirect('/auth/error?message=unknown_error')
	} catch (error) {
		console.error('Unexpected error during confirmation:', error)
		return redirect('/auth/error?message=server_error')
	}
}
