import type {
	Tables,
	TablesInsert,
	TablesUpdate,
} from '@/libs/supabase/database'

export type Client = Tables<'clients'>
export type ClientInsert = TablesInsert<'clients'>
export type ClientUpdate = TablesUpdate<'clients'>

export type ClientDatabase = Pick<
	Tables<'clients'>,
	'id' | 'name' | 'email' | 'phone' | 'createdAt' | 'status'
>
export type ClientStatus = Tables<'clients'>['status']
