import type { Tables, TablesInsert, TablesUpdate } from './supabase-generated'

export type Profile = Tables<'profiles'>
export type ProfileType = Tables<'profiles'>['type']
export type InsertProfile = TablesInsert<'profiles'>
export type UpdateProfile = TablesUpdate<'profiles'>
