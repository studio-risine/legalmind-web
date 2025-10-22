'use server'

import { env } from '@infra/env'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
	const cookieStore = await cookies()

	return createServerClient(
		env.NEXT_PUBLIC_SUPABASE_URL || '',
		env.SUPABASE_SCRET_KEY,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) =>
							cookieStore.set(name, value, options),
						)
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	)
}

/**
 * Create a Supabase admin client using the service role key.
 * This is intended for backend jobs/scripts (e.g., seeds, migrations helpers).
 *
 * Notes on auth options:
 * - autoRefreshToken: false – no background token refresh is needed for service role usage
 * - persistSession: false  – do not write session to storage; keeps scripts stateless/deterministic
 */
export function createSupabaseAdminClient() {
	return createSupabaseClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.SUPABASE_SCRET_KEY,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	)
}
