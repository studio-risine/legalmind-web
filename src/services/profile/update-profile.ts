import { supabase } from '@/libs/supabase/client'
import type { UpdateProfile } from '@/types/supabase/profile'

export async function updateProfile(args: UpdateProfile & { id: string }) {
	const { status, error } = await supabase
		.from('profiles')
		.update({
			...args,
			updated_at: new Date().toISOString(),
		})
		.eq('id', args.id)

	if (error) throw new Error(error.message)

	return {
		status,
		error,
	}
}
