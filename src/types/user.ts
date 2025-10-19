import type { Tables, TablesInsert, TablesUpdate } from './database'

export type User = Tables<'users'>
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>
