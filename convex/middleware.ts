import { ConvexError } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import {
	getCurrentUser,
	requireAccountAccess,
	requireAccountAdmin,
	requireAccountAdminQuery,
	requireMinimumRoleCtx,
	requireMinimumRoleQuery,
	requireSuperAdmin,
	requireSuperAdminQuery,
} from './auth'

// Type aliases for better readability
type User = Doc<'users'>
type Account = Doc<'accounts'>

/**
 * Authorization Middleware for Convex Functions
 *
 * This middleware provides a higher-level abstraction for common authorization patterns,
 * making it easier to secure mutations and queries with consistent permission checks.
 */

/**
 * Middleware for mutations that require authentication
 */
export function withAuth<Args, Return>(
	handler: (ctx: MutationCtx, args: Args, user: User) => Promise<Return>,
) {
	return async (ctx: MutationCtx, args: Args): Promise<Return> => {
		const user = await getCurrentUser(ctx)
		return handler(ctx, args, user)
	}
}

/**
 * Middleware for queries that require authentication
 */
export function withAuthQuery<Args, Return>(
	handler: (ctx: QueryCtx, args: Args, user: User) => Promise<Return>,
) {
	return async (ctx: QueryCtx, args: Args): Promise<Return> => {
		const user = await getCurrentUser(ctx)
		return handler(ctx, args, user)
	}
}

/**
 * Middleware for mutations that require a minimum role
 */
export function withRole<Args extends Record<string, unknown>, Return>(
	role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER',
	handler: (
		ctx: MutationCtx & { user: User; account: Account | null },
		args: Args,
	) => Promise<Return>,
) {
	return async (ctx: MutationCtx, args: Args): Promise<Return> => {
		const user = await requireMinimumRoleCtx(ctx, role)
		const account = user.accountId ? await ctx.db.get(user.accountId) : null
		const authCtx = { ...ctx, user, account }
		return handler(authCtx, args)
	}
}

/**
 * Middleware for queries that require a minimum role
 */
export function withRoleQuery<Args extends Record<string, unknown>, Return>(
	role: 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER',
	handler: (
		ctx: QueryCtx & { user: User; account: Account | null },
		args: Args,
	) => Promise<Return>,
) {
	return async (ctx: QueryCtx, args: Args): Promise<Return> => {
		const user = await requireMinimumRoleQuery(ctx, role)
		const account = user.accountId ? await ctx.db.get(user.accountId) : null
		const authCtx = { ...ctx, user, account }
		return handler(authCtx, args)
	}
}

/**
 * Middleware for mutations that require account access
 */
export function withAccountAccess<Args extends { accountId?: string }, Return>(
	handler: (
		ctx: MutationCtx,
		args: Args,
		user: User,
		account: Account,
	) => Promise<Return>,
) {
	return async (ctx: MutationCtx, args: Args): Promise<Return> => {
		const user = await getCurrentUser(ctx)

		// Get account ID from args or user's account
		const accountId = args.accountId || user.accountId
		if (!accountId) {
			throw new ConvexError('Account ID is required')
		}

		// Verify access and get the account
		await requireAccountAccess(ctx, accountId as Id<'accounts'>)
		const account = await ctx.db.get(accountId as Id<'accounts'>)
		if (!account) {
			throw new ConvexError('Account not found')
		}

		return handler(ctx, args, user, account)
	}
}

/**
 * Middleware for queries that require account access
 */
export function withAccountAccessQuery<
	Args extends { accountId?: string },
	Return,
>(
	handler: (
		ctx: QueryCtx,
		args: Args,
		user: User,
		account: Account,
	) => Promise<Return>,
) {
	return async (ctx: QueryCtx, args: Args): Promise<Return> => {
		const user = await getCurrentUser(ctx)

		// Get account ID from args or user's account
		const accountId = args.accountId || user.accountId
		if (!accountId) {
			throw new ConvexError('Account ID is required')
		}

		// Verify access and get the account
		await requireAccountAccess(ctx, accountId as Id<'accounts'>)
		const account = await ctx.db.get(accountId as Id<'accounts'>)
		if (!account) {
			throw new ConvexError('Account not found')
		}

		return handler(ctx, args, user, account)
	}
}

/**
 * Middleware for super admin only operations
 */
export function withSuperAdmin<Args extends Record<string, unknown>, Return>(
	handler: (
		ctx: MutationCtx & { user: User; account: Account | null },
		args: Args,
	) => Promise<Return>,
) {
	return async (ctx: MutationCtx, args: Args): Promise<Return> => {
		const user = await requireSuperAdmin(ctx)
		const account = user.accountId ? await ctx.db.get(user.accountId) : null
		const authCtx = { ...ctx, user, account }
		return handler(authCtx, args)
	}
}

/**
 * Middleware for super admin only queries
 */
export function withSuperAdminQuery<
	Args extends Record<string, unknown>,
	Return,
>(
	handler: (
		ctx: QueryCtx & { user: User; account: Account | null },
		args: Args,
	) => Promise<Return>,
) {
	return async (ctx: QueryCtx, args: Args): Promise<Return> => {
		const user = await requireSuperAdminQuery(ctx)
		const account = user.accountId ? await ctx.db.get(user.accountId) : null
		const authCtx = { ...ctx, user, account }
		return handler(authCtx, args)
	}
}

/**
 * Middleware for account admin operations
 */
export function withAccountAdmin<Args extends Record<string, unknown>, Return>(
	handler: (
		ctx: MutationCtx & { user: User; account: Account | null },
		args: Args,
	) => Promise<Return>,
) {
	return async (ctx: MutationCtx, args: Args): Promise<Return> => {
		// Get account ID from args or user's account
		const accountId = args.accountId
		if (!accountId) {
			throw new ConvexError('Account ID is required')
		}

		const user = await requireAccountAdmin(ctx, accountId as Id<'accounts'>)
		const account = user.accountId ? await ctx.db.get(user.accountId) : null

		const authCtx = { ...ctx, user, account }
		return handler(authCtx, args)
	}
}

/**
 * Middleware for account admin queries
 */
export function withAccountAdminQuery<
	Args extends Record<string, unknown>,
	Return,
>(
	handler: (
		ctx: QueryCtx & { user: User; account: Account | null },
		args: Args,
	) => Promise<Return>,
) {
	return async (ctx: QueryCtx, args: Args): Promise<Return> => {
		// Get account ID from args or user's account
		const accountId = args.accountId
		if (!accountId) {
			throw new ConvexError('Account ID is required')
		}

		const user = await requireAccountAdminQuery(
			ctx,
			accountId as Id<'accounts'>,
		)
		const account = user.accountId ? await ctx.db.get(user.accountId) : null

		const authCtx = { ...ctx, user, account }
		return handler(authCtx, args)
	}
}

/**
 * Utility function to validate and sanitize input data
 */
export function validateInput<T>(
	data: T,
	rules: Record<string, (value: unknown) => boolean>,
): T {
	for (const [field, validator] of Object.entries(rules)) {
		const value = (data as Record<string, unknown>)[field]
		if (value !== undefined && !validator(value)) {
			throw new ConvexError(`Invalid value for field: ${field}`)
		}
	}
	return data
}

/**
 * Common validation rules
 */
export const validationRules = {
	email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
	url: (value: string) => {
		try {
			new URL(value)
			return true
		} catch {
			return false
		}
	},
	slug: (value: string) => /^[a-z0-9-]+$/.test(value),
	phone: (value: string) => /^[+]?[1-9]?[0-9]{7,15}$/.test(value),
	color: (value: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value),
	nonEmpty: (value: string) => value.trim().length > 0,
	minLength: (min: number) => (value: string) => value.length >= min,
	maxLength: (max: number) => (value: string) => value.length <= max,
	range: (min: number, max: number) => (value: number) =>
		value >= min && value <= max,
}

/**
 * Rate limiting utility (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
	key: string,
	maxRequests: number,
	windowMs: number,
): boolean {
	const now = Date.now()
	const record = rateLimitMap.get(key)

	if (!record || now > record.resetTime) {
		// Reset or create new record
		rateLimitMap.set(key, {
			count: 1,
			resetTime: now + windowMs,
		})
		return true
	}

	if (record.count >= maxRequests) {
		return false
	}

	record.count++
	return true
}

/**
 * Middleware with rate limiting
 */
export function withRateLimit<Args, Return>(
	maxRequests: number,
	windowMs: number,
	getKey: (ctx: MutationCtx, args: Args) => string,
	handler: (ctx: MutationCtx, args: Args) => Promise<Return>,
) {
	return async (ctx: MutationCtx, args: Args): Promise<Return> => {
		const key = getKey(ctx, args)

		if (!rateLimit(key, maxRequests, windowMs)) {
			throw new ConvexError('Rate limit exceeded. Please try again later.')
		}

		return handler(ctx, args)
	}
}
