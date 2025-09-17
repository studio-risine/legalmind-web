import type { User } from '@/types/supabase'

export interface NavUserDto {
	displayName: string | null
	firstName: string | null
	email: string | null
	avatar: string | null
}

export function convertUserToNavUserDto(user: User): NavUserDto {
	if (!user) {
		return {
			displayName: null,
			firstName: null,
			email: null,
			avatar: null,
		}
	}

	return {
		displayName: user.display_name,
		firstName: user.first_name,
		email: user.email,
		avatar: user.avatar,
	}
}
