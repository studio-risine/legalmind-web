import type { Database } from './supabase-generated'

export type User = Database['public']['Tables']['users']['Row']
export type UserRoleType = Database['public']['Enums']['UserRoleType'] | null
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']
