import { ConvexError } from 'convex/values'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

/**
 * Authorization utilities for the SaaS Starter Kit
 *
 * This module implements authorization patterns following Convex best practices:
 * https://stack.convex.dev/authorization
 *
 * Key principles:
 * 1. Always validate user identity first
 * 2. Check permissions at the data access level
 * 3. Use consistent error messages
 * 4. Log authorization failures for security monitoring
 */

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
	SUPER_ADMIN: 3,
	ADMIN: 2,
	MEMBER: 1,
} as const

type UserRole = keyof typeof ROLE_HIERARCHY

/**
 * Get the current authenticated user from the context
 * Throws an error if user is not authenticated
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity()
	if (!identity) {
		throw new ConvexError('Authentication required')
	}

	const user = await ctx.db
		.query('users')
		.withIndex('by_email', (q) => q.eq('email', identity.email!))
		.unique()

	if (!user) {
		throw new ConvexError('User not found')
	}

	if (!user.isActive) {
		throw new ConvexError('User account is inactive')
	}

	return user
}

/**
 * Get the current user's account
 * Throws an error if user doesn't belong to an account
 */
export async function getCurrentUserAccount(ctx: QueryCtx | MutationCtx) {
	const user = await getCurrentUser(ctx)

	if (!user.accountId) {
		throw new ConvexError('User is not associated with an account')
	}

	const account = await ctx.db.get(user.accountId)
	if (!account) {
		throw new ConvexError('Account not found')
	}

	if (!account.isActive) {
		throw new ConvexError('Account is inactive')
	}

	return { user, account }
}

/**
 * Check if user has minimum required role
 */
export function hasMinimumRole(
	userRole: UserRole,
	requiredRole: UserRole,
): boolean {
	return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Ensure user has minimum required role
 * Throws an error if user doesn't have sufficient permissions
 */
export function requireMinimumRole(userRole: UserRole, requiredRole: UserRole) {
	if (!hasMinimumRole(userRole, requiredRole)) {
		throw new ConvexError(
			`Insufficient permissions. Required: ${requiredRole}, Current: ${userRole}`,
		)
	}
}

/**
 * Ensure current user has minimum required role
 * Returns the user if they have sufficient permissions
 */
export async function requireMinimumRoleCtx(
	ctx: QueryCtx | MutationCtx,
	requiredRole: UserRole,
) {
	const user = await getCurrentUser(ctx)
	requireMinimumRole(user.role, requiredRole)
	return user
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(userRole: UserRole): boolean {
	return userRole === 'SUPER_ADMIN'
}

/**
 * Check if user is an admin (account admin or super admin)
 */
export function isAdmin(userRole: UserRole): boolean {
	return hasMinimumRole(userRole, 'ADMIN')
}

/**
 * Ensure user can access a specific account
 * Super admins can access any account, others can only access their own
 */
export async function requireAccountAccess(
	ctx: QueryCtx | MutationCtx,
	accountId: Id<'accounts'>,
) {
	const user = await getCurrentUser(ctx)

	// Super admins can access any account
	if (isSuperAdmin(user.role)) {
		return user
	}

	// Regular users can only access their own account
	if (user.accountId !== accountId) {
		throw new ConvexError('Access denied: Cannot access this account')
	}

	return user
}

/**
 * Ensure user can modify a specific product
 * Only account members can modify products in their account
 */
export async function requireProductAccess(
	ctx: QueryCtx | MutationCtx,
	productId: Id<'products'>,
) {
	const user = await getCurrentUser(ctx)
	const product = await ctx.db.get(productId)

	if (!product) {
		throw new ConvexError('Product not found')
	}

	// Super admins can access any product
	if (isSuperAdmin(user.role)) {
		return { user, product }
	}

	// Regular users can only access products in their account
	if (user.accountId !== product.accountId) {
		throw new ConvexError('Access denied: Cannot access this product')
	}

	return { user, product }
}

/**
 * Ensure user can perform admin actions on an account
 * Only account admins and super admins can perform admin actions
 */
export async function requireAccountAdmin(
	ctx: QueryCtx | MutationCtx,
	accountId?: Id<'accounts'>,
) {
	const user = await getCurrentUser(ctx)

	// Super admins can perform admin actions on any account
	if (isSuperAdmin(user.role)) {
		return user
	}

	// Check if user is admin of the specified account
	if (accountId && user.accountId !== accountId) {
		throw new ConvexError('Access denied: Cannot administer this account')
	}

	// Check if user has admin role
	if (!isAdmin(user.role)) {
		throw new ConvexError('Access denied: Admin privileges required')
	}

	return user
}

/**
 * Query version of requireAccountAdmin
 */
export async function requireAccountAdminQuery(
	ctx: QueryCtx,
	accountId?: Id<'accounts'>,
) {
	return requireAccountAdmin(ctx, accountId)
}

/**
 * Ensure user is a super admin
 * Only super admins can perform platform-level operations
 */
export async function requireSuperAdmin(ctx: QueryCtx | MutationCtx) {
	const user = await getCurrentUser(ctx)

	if (!isSuperAdmin(user.role)) {
		throw new ConvexError('Access denied: Super admin privileges required')
	}

	return user
}

/**
 * Query version of requireSuperAdmin
 */
export async function requireSuperAdminQuery(ctx: QueryCtx) {
	return requireSuperAdmin(ctx)
}

/**
 * Query version of requireMinimumRoleCtx
 */
export async function requireMinimumRoleQuery(
	ctx: QueryCtx,
	requiredRole: UserRole,
) {
	return requireMinimumRoleCtx(ctx, requiredRole)
}

/**
 * Log an activity for audit trail
 */
export async function logActivity(
	ctx: MutationCtx,
	action: string,
	entityType: string,
	entityId: string,
	metadata?: Record<string, unknown>,
) {
	try {
		const user = await getCurrentUser(ctx)

		await ctx.db.insert('activityLogs', {
			action,
			entityType,
			entityId,
			actorId: user._id,
			actorEmail: user.email,
			actorRole: user.role,
			accountId: user.accountId,
			metadata,
			createdAt: Date.now(),
		})
	} catch (error) {
		// Don't fail the main operation if logging fails
		console.error('Failed to log activity:', error)
	}
}

/**
 * Validate account limits before creating new resources
 */
export async function validateAccountLimits(
	ctx: QueryCtx | MutationCtx,
	accountId: Id<'accounts'>,
	resourceType: 'users' | 'products',
) {
	const account = await ctx.db.get(accountId)
	if (!account) {
		throw new ConvexError('Account not found')
	}

	if (resourceType === 'users') {
		const userCount = await ctx.db
			.query('users')
			.withIndex('by_account', (q) => q.eq('accountId', accountId))
			.collect()
			.then((users) => users.length)

		if (userCount >= account.maxUsers) {
			throw new ConvexError(
				`Account has reached the maximum number of users (${account.maxUsers})`,
			)
		}
	}

	if (resourceType === 'products') {
		const productCount = await ctx.db
			.query('products')
			.withIndex('by_account', (q) => q.eq('accountId', accountId))
			.collect()
			.then((products) => products.length)

		if (productCount >= account.maxProducts) {
			throw new ConvexError(
				`Account has reached the maximum number of products (${account.maxProducts})`,
			)
		}
	}
}
