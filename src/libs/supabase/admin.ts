import { env } from '@infra/env'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

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
		env.NEXT_PUBLIC_SUPABASE_URL || '',
		env.SUPABASE_SCRET_KEY,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	)
}
