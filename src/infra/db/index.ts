import { env } from '@infra/env'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from './schemas'

// Disable prepared statements to be compatible with Supabase Pooler (transaction mode)
const globalForPg = globalThis as unknown as {
	pg: ReturnType<typeof postgres> | undefined
}
const globalForDb = globalThis as unknown as {
	db: PostgresJsDatabase<typeof schema> | undefined
}

export const pg =
	globalForPg.pg ??
	// biome-ignore lint/suspicious/noAssignInExpressions: False positive, pg is initialized only once
	(globalForPg.pg = postgres(env.DATABASE_URL, {
		prepare: false,
		max: 5,
		idle_timeout: 5000,
		connect_timeout: 10_000,
	}))

// biome-ignore lint/suspicious/noAssignInExpressions: False positive, db is initialized only once
export const db = globalForDb.db ?? (globalForDb.db = drizzle(pg, { schema }))
