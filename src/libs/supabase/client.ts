import { env } from '@infra/env'
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
	return createBrowserClient(
		env.NEXT_PUBLIC_SUPABASE_URL!,
		env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
	)
}
