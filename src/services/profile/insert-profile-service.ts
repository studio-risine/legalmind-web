import type { PostgrestError } from '@supabase/supabase-js'
import { createClient } from '@/libs/supabase/client'
import type { Profile, ProfileInsert } from '@/types'

export interface InsertProfileOutput {
	profile: Profile | null
	error: PostgrestError | null
}

export async function insertProfile(
	args: ProfileInsert,
): Promise<InsertProfileOutput> {
	try {
		const supabase = createClient()
		const { data, error } = await supabase
			.from('profiles')
			.insert({
				...args,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
			.select()
			.single()

		if (error) {
			return {
				profile: null,
				error,
			}
		}

		return {
			profile: data,
			error: null,
		}
	} catch (error) {
		console.error('Unexpected error:', error)

		return {
			profile: null,
			error: { message: 'Unexpected error occurred' } as PostgrestError,
		}
	}
}
