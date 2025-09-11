import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@/libs/supabase/client'
import type { Profile } from '@/types/supabase'

export interface GetProfileByIdOutput {
	data: Profile | null
	error: PostgrestError | null
}

export async function getProfileById(
	id: string,
): Promise<GetProfileByIdOutput> {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', id)
			.maybeSingle()

		if (error) {
			return { data: null, error }
		}

		return { data, error: null }
	} catch (error) {
		console.error('Unexpected error:', error)

		return {
			data: null,
			error: { message: 'Unexpected error occurred' } as PostgrestError,
		}
	}
}
