import { supabase } from '@/libs/supabase/client'
import type { InsertProfile } from '@/types/supabase/profile'

export async function insertProfile(args: InsertProfile) {
	const { data, error } = await supabase
		.from('profiles')
		.insert({
			...args,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
		.select()
		.single()

	if (error) throw new Error(error.message)

	return {
		data,
		error,
	}
}