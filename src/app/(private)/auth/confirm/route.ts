import { createClient } from '@libs/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

// Handles Supabase email confirmation and password recovery links
export async function GET(req: NextRequest) {
	const url = new URL(req.url)
	const token_hash = url.searchParams.get('token_hash')
	const type = url.searchParams.get('type') as
		| 'email'
		| 'recovery'
		| 'invite'
		| 'magiclink'
		| null
	const next = url.searchParams.get('next')

	// If required params are missing, redirect to error page
	if (!token_hash || !type) {
		return NextResponse.redirect(new URL('/auth/auth-code-error', url.origin))
	}

	const supabase = await createClient()
	const { error } = await supabase.auth.verifyOtp({ token_hash, type })

	if (error) {
		// Invalid or expired token
		console.error('Auth verification error:', error.message)
		return NextResponse.redirect(new URL('/auth/auth-code-error', url.origin))
	}

	// Decide where to go next
	const redirectPath = (() => {
		if (next) return next
		if (type === 'recovery') return '/account/update-password'
		if (type === 'magiclink' || type === 'invite') return '/dashboard'
		// For email confirmation, send the user to login
		return '/account/login'
	})()

	return NextResponse.redirect(new URL(redirectPath, url.origin))
}
