import type { Tables, TablesInsert, TablesUpdate } from './supabase-generated'

export type User = Tables<'users'>
export type UserRoleType = Tables<'users'>['role']
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>
