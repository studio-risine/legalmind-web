import { supabase } from '@/libs/supabase/client'

export async function updateProfile(args: any) {
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
