import { z } from 'zod'

const schema = z.object({
	CONVEX_DEPLOY_KEY: z.string(),
	CONVEX_DEPLOYMENT: z.string(),
	NEXT_PUBLIC_CONVEX_URL: z.url(),
	NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
	PORT: z.coerce.number().default(3000),
	SUPER_ADMIN_EMAIL: z.email().default('admin@example.com'),
	SUPER_ADMIN_PASSWORD: z.string().min(6).default('123456'),
})

const _env = schema.safeParse(process.env)

if (_env.success === false) {
	console.error('❌ Invalid environment variables', _env.error.format())

	throw new Error('Invalid environment variables.')
}

export const env = _env.data
