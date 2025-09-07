import { z } from 'zod'

const schema = z.object({
	CONVEX_DEPLOY_KEY: z.string(),
	CONVEX_DEPLOYMENT: z.string(),
	NEXT_PUBLIC_CONVEX_URL: z.url(),
	NODE_ENV: z.enum(['development', 'production']).default('development'),
	PORT: z.coerce.number().default(3000),
	SUPER_ADMIN_EMAIL: z.email().default('admin@example.com'),
	SUPER_ADMIN_PASSWORD: z.string().min(6).default('123456'),
	NEXT_PUBLIC_SUPABASE_URL: z.url(),
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string(),
})

const _env = schema.safeParse(process.env)

if (_env.success === false) {
	console.error('❌ Invalid environment variables:', _env.error.format())

	const errorMessages = _env.error.issues
		.map((issue) => {
			const path = issue.path.join('.')
			const value = process.env[path]
			const valueDisplay = value ? `(current: "${value}")` : '(not set)'

			return `- ${path}: ${issue.message} ${valueDisplay}`
		})
		.join('\n')

	const detailedError = `Invalid environment variables:\n${errorMessages}`
	console.error(detailedError)
	// throw new Error(detailedError)
}

export const env = _env.data
