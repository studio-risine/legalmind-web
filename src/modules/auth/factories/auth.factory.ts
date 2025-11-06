import { createClient } from '@libs/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function makeSupabaseServerClient(): Promise<SupabaseClient> {
	return await createClient()
}

export const makeAuthClient = makeSupabaseServerClient
