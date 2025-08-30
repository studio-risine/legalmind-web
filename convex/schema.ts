import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Database Schema for SaaS Starter Kit
 *
 * This schema implements a multi-tenant RBAC system with:
 * - Users: Authentication and basic user data
 * - Accounts: Tenant/organization data with profile information
 * - Products: Business entities owned by accounts
 * - Roles: RBAC system with hierarchical permissions
 *
 * Authorization Levels:
 * - SUPER_ADMIN: Platform administrator (manages all accounts)
 * - ADMIN: Account administrator (manages account and its products)
 * - MEMBER: Account member (read-only access to account products)
 */

export default defineSchema({
	/**
	 * Users table - Authentication and basic user information
	 * Each user can belong to only one account
	 */
	users: defineTable({
		// Authentication fields
		email: v.string(),
		name: v.string(),
		avatarUrl: v.optional(v.string()),

		// Account relationship
		accountId: v.optional(v.id('accounts')),

		// Role within the account
		role: v.union(
			v.literal('SUPER_ADMIN'), // Platform administrator
			v.literal('ADMIN'), // Account administrator
			v.literal('MEMBER'), // Account member
		),

		// Metadata
		isActive: v.boolean(),
		lastLoginAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_email', ['email'])
		.index('by_account', ['accountId'])
		.index('by_role', ['role']),

	/**
	 * Accounts table - Tenant/Organization data
	 * Each account represents a separate tenant in the system
	 */
	accounts: defineTable({
		// Basic account information
		name: v.string(),
		slug: v.string(), // URL-friendly identifier
		description: v.optional(v.string()),

		// Branding
		logoUrl: v.optional(v.string()),
		primaryColor: v.optional(v.string()),

		// Contact information
		website: v.optional(v.string()),
		contactEmail: v.optional(v.string()),
		phone: v.optional(v.string()),

		// Address
		address: v.optional(
			v.object({
				street: v.string(),
				city: v.string(),
				state: v.string(),
				zipCode: v.string(),
				country: v.string(),
			}),
		),

		// Subscription and limits
		plan: v.union(
			v.literal('FREE'),
			v.literal('BASIC'),
			v.literal('PRO'),
			v.literal('ENTERPRISE'),
		),
		maxUsers: v.number(),
		maxProducts: v.number(),

		// Status
		isActive: v.boolean(),
		suspendedAt: v.optional(v.number()),
		suspensionReason: v.optional(v.string()),

		// Metadata
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_slug', ['slug'])
		.index('by_plan', ['plan'])
		.index('by_active', ['isActive']),

	/**
	 * Products table - Business entities owned by accounts
	 * Each product belongs to exactly one account
	 */
	products: defineTable({
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),

		category: v.optional(v.string()),
		tags: v.array(v.string()),
		imageUrl: v.optional(v.string()),
		images: v.array(v.string()),

		price: v.number(),
		currency: v.string(),
		compareAtPrice: v.optional(v.number()),

		sku: v.optional(v.string()),
		trackInventory: v.boolean(),
		inventoryQuantity: v.optional(v.number()),
		allowBackorder: v.boolean(),

		status: v.union(
			v.literal('DRAFT'),
			v.literal('ACTIVE'),
			v.literal('ARCHIVED'),
		),
		featured: v.boolean(),

		metaTitle: v.optional(v.string()),
		metaDescription: v.optional(v.string()),

		accountId: v.id('accounts'),
		createdBy: v.id('users'),
		updatedBy: v.id('users'),

		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_account', ['accountId'])
		.index('by_slug', ['accountId', 'slug'])
		.index('by_status', ['accountId', 'status'])
		.index('by_category', ['accountId', 'category'])
		.index('by_featured', ['accountId', 'featured'])
		.index('by_created_by', ['createdBy'])
		.index('by_updated_by', ['updatedBy']),

	/**
	 * Activity Log table - Audit trail for important actions
	 * Tracks who did what and when for compliance and debugging
	 */
	activityLogs: defineTable({
		action: v.string(), // e.g., 'product.created', 'user.invited', 'account.suspended'
		entityType: v.string(), // e.g., 'product', 'user', 'account'
		entityId: v.string(),

		actorId: v.id('users'),
		actorEmail: v.string(),
		actorRole: v.string(),

		accountId: v.optional(v.id('accounts')),
		metadata: v.optional(v.any()),
		ipAddress: v.optional(v.string()),
		userAgent: v.optional(v.string()),

		createdAt: v.number(),
	})
		.index('by_account', ['accountId'])
		.index('by_actor', ['actorId'])
		.index('by_entity', ['entityType', 'entityId'])
		.index('by_action', ['action'])
		.index('by_created_at', ['createdAt']),

	/**
	 * Invitations table - Manage user invitations to accounts
	 * Allows account admins to invite new users
	 */
	invitations: defineTable({
		email: v.string(),
		role: v.union(v.literal('ADMIN'), v.literal('MEMBER')),
		accountId: v.id('accounts'),

		token: v.string(),
		invitedBy: v.id('users'),
		message: v.optional(v.string()),

		// Status
		status: v.union(
			v.literal('PENDING'),
			v.literal('ACCEPTED'),
			v.literal('EXPIRED'),
			v.literal('REVOKED'),
		),
		acceptedAt: v.optional(v.number()),
		acceptedBy: v.optional(v.id('users')),

		// Timestamps
		expiresAt: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_email', ['email'])
		.index('by_token', ['token'])
		.index('by_account', ['accountId'])
		.index('by_status', ['status'])
		.index('by_invited_by', ['invitedBy']),
})
