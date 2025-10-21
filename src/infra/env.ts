import { z } from 'zod'

const envSchema = z.object({
	PORT: z.coerce.number().min(1).max(65535).default(3333),
	NODE_ENV: z
		.enum(['development', 'test', 'production'])
		.default('development'),
	DATABASE_URL: z
		.string()
		.refine(
			(url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
			{ message: 'DATABASE_URL must start with postgresql:// or postgres://' },
		),
	NEXT_PUBLIC_SUPABASE_URL: z.url(),
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
	SUPABASE_SCRET_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
