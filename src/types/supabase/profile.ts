import type { Tables } from './supabase-generated'

export type Profile = Tables<'profiles'>
export type ProfileType = Tables<'profiles'>['type']
