import type { PostgrestError } from '@supabase/supabase-js'
import { createClient } from '@/libs/supabase/client'
import type { Profile } from '@/types'

export interface GetProfileByIdOutput {
	profile: Profile | null
	error: PostgrestError | null
}

export async function getProfileById(
	id: string,
): Promise<GetProfileByIdOutput> {
	try {
		const supabase = createClient()
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', id)
			.maybeSingle()

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
