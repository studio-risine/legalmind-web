import { ConvexError, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import {
	getCurrentUser,
	getCurrentUserAccount,
	logActivity,
	requireAccountAccess,
	requireAccountAdmin,
	requireSuperAdmin,
} from './auth'

// Type alias for Account
type Account = Doc<'accounts'>

// Type for account update data
type AccountUpdateData = Partial<{
	name: string
	slug: string
	description: string
	website: string
	logoUrl: string
	address: {
		street: string
		city: string
		state: string
		zipCode: string
		country: string
	}
	contactEmail: string
	phone: string
	primaryColor: string
	maxUsers: number
	maxProducts: number
	plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
	isActive: boolean
	suspendedAt: number
	suspensionReason: string
	updatedAt: number
}>

/**
 * Account mutations and queries with RBAC authorization
 *
 * Authorization rules:
 * - Users can only access their own account
 * - Super admins can access all accounts
 * - Only account admins can update account settings
 * - Only super admins can create/delete accounts
 * - All operations are logged for audit trail
 */

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new account
 * Requires: Admin or Super admin privileges
 */
export const createAccount = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		website: v.optional(v.string()),
		logoUrl: v.optional(v.string()),
		address: v.optional(
			v.object({
				street: v.string(),
				city: v.string(),
				state: v.string(),
				zipCode: v.string(),
				country: v.string(),
			}),
		),
		contactEmail: v.optional(v.string()),
		phone: v.optional(v.string()),
		primaryColor: v.optional(v.string()),
		maxUsers: v.optional(v.number()),
		maxProducts: v.optional(v.number()),
		plan: v.optional(
			v.union(
				v.literal('FREE'),
				v.literal('BASIC'),
				v.literal('PRO'),
				v.literal('ENTERPRISE'),
			),
		),
		isActive: v.optional(v.boolean()),
		suspendedAt: v.optional(v.number()),
		suspensionReason: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const _user = await requireAccountAdmin(ctx)

		// Check if slug is unique
		const existingAccount = await ctx.db
			.query('accounts')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.unique()

		if (existingAccount) {
			throw new ConvexError(`Account with slug '${args.slug}' already exists`)
		}

		// Validate email if provided
		if (args.contactEmail) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!emailRegex.test(args.contactEmail)) {
				throw new ConvexError('Invalid email format')
			}
		}

		const now = Date.now()

		const accountId = await ctx.db.insert('accounts', {
			name: args.name,
			slug: args.slug,
			description: args.description,
			website: args.website,
			logoUrl: args.logoUrl,
			address: args.address,
			contactEmail: args.contactEmail,
			phone: args.phone,
			primaryColor: args.primaryColor,
			maxUsers: args.maxUsers || 10,
			maxProducts: args.maxProducts || 100,
			plan: args.plan || 'FREE',
			isActive: args.isActive !== undefined ? args.isActive : true,
			suspendedAt: args.suspendedAt,
			suspensionReason: args.suspensionReason,

			createdAt: now,
			updatedAt: now,
		})

		// Log activity
		await logActivity(ctx, 'account.created', 'account', accountId, {
			accountName: args.name,
			accountSlug: args.slug,
		})

		return accountId
	},
})

/**
 * Update account information
 * Requires: Account admin privileges or super admin
 */
export const updateAccount = mutation({
	args: {
		accountId: v.optional(v.id('accounts')), // Optional for current account
		name: v.optional(v.string()),
		slug: v.optional(v.string()),
		description: v.optional(v.string()),
		website: v.optional(v.string()),
		logoUrl: v.optional(v.string()),
		address: v.optional(
			v.object({
				street: v.string(),
				city: v.string(),
				state: v.string(),
				zipCode: v.string(),
				country: v.string(),
			}),
		),
		contactEmail: v.optional(v.string()),
		phone: v.optional(v.string()),
		primaryColor: v.optional(v.string()),
		maxUsers: v.optional(v.number()),
		maxProducts: v.optional(v.number()),
		plan: v.optional(
			v.union(
				v.literal('FREE'),
				v.literal('BASIC'),
				v.literal('PRO'),
				v.literal('ENTERPRISE'),
			),
		),
		isActive: v.optional(v.boolean()),
		suspendedAt: v.optional(v.number()),
		suspensionReason: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUser(ctx)

		let account: Account
		if (args.accountId) {
			// Updating specific account - requires super admin or account admin
			await requireAccountAccess(ctx, args.accountId)
			const foundAccount = await ctx.db.get(args.accountId)
			if (!foundAccount) {
				throw new ConvexError('Account not found')
			}
			account = foundAccount

			// Check if user is account admin or super admin
			if (user.role !== 'SUPER_ADMIN') {
				const userAccount = await ctx.db
					.query('users')
					.withIndex('by_account', (q) => q.eq('accountId', args.accountId))
					.filter((q) => q.eq(q.field('_id'), user._id))
					.unique()

				if (!userAccount || userAccount.role !== 'ADMIN') {
					throw new ConvexError(
						'Insufficient permissions to update this account',
					)
				}
			}
		} else {
			// Updating current user's account
			const result = await getCurrentUserAccount(ctx)
			account = result.account

			// Check if user is account admin
			if (user.role !== 'ADMIN') {
				throw new ConvexError('Only account admins can update account settings')
			}
		}

		// Check if new slug is unique (if slug is being changed)
		if (args.slug && args.slug !== account.slug) {
			const existingAccount = await ctx.db
				.query('accounts')
				.withIndex('by_slug', (q) => q.eq('slug', args.slug!))
				.first()

			if (existingAccount) {
				throw new ConvexError('Account slug already exists')
			}
		}

		// Validate email format (if provided)
		if (args.contactEmail) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!emailRegex.test(args.contactEmail)) {
				throw new ConvexError('Invalid email format')
			}
		}

		// Prepare update data
		const updateData: AccountUpdateData = {}
		if (args.name !== undefined) updateData.name = args.name
		if (args.slug !== undefined) updateData.slug = args.slug
		if (args.description !== undefined)
			updateData.description = args.description
		if (args.logoUrl !== undefined) updateData.logoUrl = args.logoUrl
		if (args.primaryColor !== undefined)
			updateData.primaryColor = args.primaryColor
		if (args.website !== undefined) updateData.website = args.website
		if (args.contactEmail !== undefined)
			updateData.contactEmail = args.contactEmail
		if (args.phone !== undefined) updateData.phone = args.phone
		if (args.plan !== undefined) updateData.plan = args.plan
		if (args.maxUsers !== undefined) updateData.maxUsers = args.maxUsers
		if (args.maxProducts !== undefined)
			updateData.maxProducts = args.maxProducts
		if (args.isActive !== undefined) updateData.isActive = args.isActive
		if (args.suspensionReason !== undefined)
			updateData.suspensionReason = args.suspensionReason

		if (args.address) {
			updateData.address = args.address
		}

		updateData.updatedAt = Date.now()

		await ctx.db.patch(account._id, updateData)

		// Log activity
		await logActivity(ctx, 'account.updated', 'account', account._id, {
			accountName: updateData.name || account.name,
			updatedFields: Object.keys(updateData).filter(
				(key) => key !== 'updatedAt',
			),
		})

		return account._id
	},
})

/**
 * Delete an account
 * Requires: Admin (own account only) or Super admin privileges (any account)
 * Note: This will also delete all associated users and products
 */
export const deleteAccount = mutation({
	args: {
		accountId: v.id('accounts'),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUser(ctx)

		// Check if user has minimum admin privileges
		if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
			throw new ConvexError('Insufficient permissions to delete account')
		}

		// Admin can only delete their own account, Super admin can delete any account
		if (user.role === 'ADMIN' && user.accountId !== args.accountId) {
			throw new ConvexError('Admin users can only delete their own account')
		}

		const account = await ctx.db.get(args.accountId)
		if (!account) {
			throw new ConvexError('Account not found')
		}

		// Delete all associated users
		const users = await ctx.db
			.query('users')
			.withIndex('by_account', (q) => q.eq('accountId', args.accountId))
			.collect()

		for (const user of users) {
			await ctx.db.delete(user._id)
		}

		// Delete all associated products
		const products = await ctx.db
			.query('products')
			.withIndex('by_account', (q) => q.eq('accountId', args.accountId))
			.collect()

		for (const product of products) {
			await ctx.db.delete(product._id)
		}

		// Delete all associated invitations
		const invitations = await ctx.db
			.query('invitations')
			.withIndex('by_account', (q) => q.eq('accountId', args.accountId))
			.collect()

		for (const invitation of invitations) {
			await ctx.db.delete(invitation._id)
		}

		// Delete the account
		await ctx.db.delete(args.accountId)

		// Log activity
		await logActivity(ctx, 'account.deleted', 'account', args.accountId, {
			accountName: account.name,
			accountSlug: account.slug,
			usersDeleted: users.length,
			productsDeleted: products.length,
		})

		return { success: true }
	},
})

/**
 * Create a new user (always with ADMIN role)
 * Requires: Super admin privileges or Admin (own account only)
 */
export const createUser = mutation({
	args: {
		email: v.string(),
		name: v.string(),
		accountId: v.id('accounts'),
		avatarUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUser(ctx)

		// Check if user has minimum admin privileges
		if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
			throw new ConvexError('Insufficient permissions to create user')
		}

		// Admin can only create users for their own account, Super admin can create for any account
		if (user.role === 'ADMIN' && user.accountId !== args.accountId) {
			throw new ConvexError(
				'Admin users can only create users for their own account',
			)
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(args.email)) {
			throw new ConvexError('Invalid email format')
		}

		// Check if email is unique
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.first()

		if (existingUser) {
			throw new ConvexError('User with this email already exists')
		}

		// Get account to check limits
		const account = await ctx.db.get(args.accountId)
		if (!account) {
			throw new ConvexError('Account not found')
		}

		// Check user limit
		const userCount = await ctx.db
			.query('users')
			.withIndex('by_account', (q) => q.eq('accountId', args.accountId))
			.collect()
			.then((users) => users.length)

		if (userCount >= account.maxUsers) {
			throw new ConvexError('Account user limit exceeded')
		}

		const now = Date.now()

		// Create user with ADMIN role by default
		const newUserId = await ctx.db.insert('users', {
			email: args.email,
			name: args.name,
			accountId: args.accountId,
			role: 'ADMIN', // Always create users as ADMIN
			avatarUrl: args.avatarUrl,
			isActive: true,
			createdAt: now,
			updatedAt: now,
		})

		// Log activity
		await logActivity(ctx, 'user.created', 'user', newUserId, {
			userEmail: args.email,
			userName: args.name,
			userRole: 'ADMIN',
			accountId: args.accountId,
		})

		return newUserId
	},
})

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get current user's account
 */
export const getCurrentAccount = query({
	args: {},
	handler: async (ctx) => {
		const { account } = await getCurrentUserAccount(ctx)
		return account
	},
})

export const getAllAccounts = query({
	args: {
		status: v.optional(
			v.union(v.literal('active'), v.literal('suspended'), v.literal('all')),
		),
		limit: v.optional(v.number()),
		cursor: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await requireSuperAdmin(ctx)

		const accountsQuery = ctx.db.query('accounts')

		// Get all accounts first
		const allAccounts = await accountsQuery.collect()

		// Filter by status if specified
		let filteredAccounts = allAccounts
		if (args.status && args.status !== 'all') {
			filteredAccounts = allAccounts.filter((account) => {
				if (args.status === 'active') {
					return account.isActive && !account.suspendedAt
				}
				if (args.status === 'suspended') {
					return !account.isActive || account.suspendedAt
				}
				return true
			})
		}

		// Apply pagination
		const limit = args.limit || 50
		let startIndex = 0

		if (args.cursor) {
			const cursorIndex = filteredAccounts.findIndex(
				(account) => account._id === args.cursor,
			)
			if (cursorIndex !== -1) {
				startIndex = cursorIndex + 1
			}
		}

		const paginatedAccounts = filteredAccounts.slice(
			startIndex,
			startIndex + limit,
		)
		const hasMore = startIndex + limit < filteredAccounts.length
		const nextCursor = hasMore
			? paginatedAccounts[paginatedAccounts.length - 1]?._id
			: null

		return {
			accounts: paginatedAccounts,
			hasMore,
			nextCursor,
		}
	},
})

/**
 * Get account by ID
 * Requires: Access to the account or super admin
 */
export const getAccount = query({
	args: {
		accountId: v.id('accounts'),
	},
	handler: async (ctx, args) => {
		const account = await requireAccountAccess(ctx, args.accountId)
		return account
	},
})

/**
 * Get account by slug
 * Requires: Access to the account or super admin
 */
export const getAccountBySlug = query({
	args: {
		slug: v.string(),
	},
	handler: async (ctx, args) => {
		const account = await ctx.db
			.query('accounts')
			.withIndex('by_slug', (q) => q.eq('slug', args.slug))
			.unique()

		if (!account) {
			throw new ConvexError('Account not found')
		}

		// Check access
		await requireAccountAccess(ctx, account._id)

		return account
	},
})

/**
 * Get account statistics
 * Requires: Access to the account or super admin
 */
export const getAccountStats = query({
	args: {
		accountId: v.optional(v.id('accounts')), // Optional for current account
	},
	handler: async (ctx, args) => {
		let account: Account
		if (args.accountId) {
			await requireAccountAccess(ctx, args.accountId)
			const foundAccount = await ctx.db.get(args.accountId)
			if (!foundAccount) {
				throw new ConvexError('Account not found')
			}
			account = foundAccount
		} else {
			const result = await getCurrentUserAccount(ctx)
			account = result.account
		}

		// Get users count
		const users = await ctx.db
			.query('users')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()

		// Get products count
		const products = await ctx.db
			.query('products')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()

		// Get invitations count
		const invitations = await ctx.db
			.query('invitations')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()

		const stats = {
			users: {
				total: users.length,
				admins: users.filter((u) => u.role === 'ADMIN').length,
				members: users.filter((u) => u.role === 'MEMBER').length,
				active: users.filter((u) => u.isActive).length,
				inactive: users.filter((u) => !u.isActive).length,
			},
			products: {
				total: products.length,
				active: products.filter((p) => p.status === 'ACTIVE').length,
				draft: products.filter((p) => p.status === 'DRAFT').length,
				archived: products.filter((p) => p.status === 'ARCHIVED').length,
			},
			invitations: {
				total: invitations.length,
				pending: invitations.filter((i) => i.status === 'PENDING').length,
				accepted: invitations.filter((i) => i.status === 'ACCEPTED').length,
				expired: invitations.filter((i) => i.status === 'EXPIRED').length,
			},
			limits: {
				users: {
					used: users.length,
					max: account.maxUsers,
					percentage: Math.round((users.length / account.maxUsers) * 100),
				},
				products: {
					used: products.length,
					max: account.maxProducts,
					percentage: Math.round((products.length / account.maxProducts) * 100),
				},
			},
		}

		return stats
	},
})

/**
 * Get account usage and limits
 * Requires: Access to the account or super admin
 */
export const getAccountUsage = query({
	args: {
		accountId: v.optional(v.id('accounts')), // Optional for current account
	},
	handler: async (ctx, args) => {
		let account: Account
		if (args.accountId) {
			await requireAccountAccess(ctx, args.accountId)
			const foundAccount = await ctx.db.get(args.accountId)
			if (!foundAccount) {
				throw new ConvexError('Account not found')
			}
			account = foundAccount
		} else {
			const result = await getCurrentUserAccount(ctx)
			account = result.account
		}

		// Get current usage
		const usersCount = await ctx.db
			.query('users')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()
			.then((users) => users.length)

		const productsCount = await ctx.db
			.query('products')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()
			.then((products) => products.length)

		return {
			limits: {
				maxUsers: account.maxUsers,
				maxProducts: account.maxProducts,
			},
			usage: {
				users: usersCount,
				products: productsCount,
				storage: 0, // TODO: Calculate actual storage usage
			},
			available: {
				users: account.maxUsers - usersCount,
				products: account.maxProducts - productsCount,
				storage: 0, // TODO: Calculate remaining storage
			},
			percentages: {
				users: Math.round((usersCount / account.maxUsers) * 100),
				products: Math.round((productsCount / account.maxProducts) * 100),
				storage: 0, // TODO: Calculate storage percentage
			},
		}
	},
})
