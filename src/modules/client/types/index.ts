import type {
	Tables,
	TablesInsert,
	TablesUpdate,
} from '@/libs/supabase/database'

export type Client = Tables<'clients'>
export type ClientInsert = TablesInsert<'clients'>
export type ClientUpdate = TablesUpdate<'clients'>

// Client status used in filters and toggle operations
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
