import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Database Schema for Legal Track - Legal Process Management System
 *
 * This schema implements a multi-tenant RBAC system for legal offices with:
 * - Users: Authentication and basic user data
 * - Accounts: Law firm/organization data with profile information
 * - Processes: Legal processes with deadlines and case management
 * - Deadlines: Legal deadlines associated with processes
 * - Clients: Client information for legal processes
 * - Tribunals: Court/tribunal information
 * - Roles: RBAC system with hierarchical permissions
 *
 * Authorization Levels:
 * - SUPER_ADMIN: Platform administrator (manages all accounts)
 * - ADMIN: Law firm administrator (manages firm and its processes)
 * - LAWYER: Lawyer (manages assigned processes and deadlines)
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
			v.literal('ADMIN'), // Law firm administrator
			v.literal('LAWYER'), // Lawyer
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
		maxProcesses: v.number(),

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
	 * Tribunals table - Court/tribunal information
	 * Each tribunal represents a court or legal jurisdiction
	 */
	tribunals: defineTable({
		name: v.string(),
		code: v.string(), // Court code identifier
		jurisdiction: v.string(), // Federal, State, Municipal
		type: v.string(), // Civil, Criminal, Labor, etc.
		address: v.optional(
			v.object({
				street: v.string(),
				city: v.string(),
				state: v.string(),
				zipCode: v.string(),
				country: v.string(),
			}),
		),
		contactInfo: v.optional(
			v.object({
				phone: v.optional(v.string()),
				email: v.optional(v.string()),
				website: v.optional(v.string()),
			}),
		),
		isActive: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_code', ['code'])
		.index('by_jurisdiction', ['jurisdiction'])
		.index('by_type', ['type'])
		.index('by_active', ['isActive']),

	/**
	 * Clients table - Client information for legal processes
	 * Each client can have multiple processes
	 */
	clients: defineTable({
		name: v.string(),
		document: v.string(), // CPF/CNPJ
		documentType: v.union(
			v.literal('CPF'),
			v.literal('CNPJ'),
			v.literal('OTHER'),
		),
		clientType: v.union(
			v.literal('INDIVIDUAL'),
			v.literal('COMPANY'),
			v.literal('GOVERNMENT'),
		),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		address: v.optional(
			v.object({
				street: v.string(),
				city: v.string(),
				state: v.string(),
				zipCode: v.string(),
				country: v.string(),
			}),
		),
		notes: v.optional(v.string()),
		accountId: v.id('accounts'),
		createdBy: v.id('users'),
		updatedBy: v.id('users'),
		isActive: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_account', ['accountId'])
		.index('by_document', ['document'])
		.index('by_type', ['clientType'])
		.index('by_active', ['accountId', 'isActive'])
		.index('by_created_by', ['createdBy']),

	/**
	 * Processes table - Legal processes/cases
	 * Each process belongs to an account and can have multiple deadlines
	 */
	processes: defineTable({
		caseNumber: v.string(), // Unique case number
		court: v.string(), // Court name
		tribunalId: v.optional(v.id('tribunals')),
		area: v.union(
			v.literal('CIVIL'),
			v.literal('LABOR'),
			v.literal('CRIMINAL'),
			v.literal('FAMILY'),
			v.literal('TAX'),
			v.literal('ADMINISTRATIVE'),
			v.literal('CONSTITUTIONAL'),
			v.literal('INTERNATIONAL'),
		),
		type: v.optional(v.string()), // Process type within area
		parties: v.object({
			plaintiff: v.object({
				name: v.string(),
				type: v.union(
					v.literal('INDIVIDUAL'),
					v.literal('COMPANY'),
					v.literal('GOVERNMENT'),
				),
				document: v.optional(v.string()),
			}),
			defendant: v.object({
				name: v.string(),
				type: v.union(
					v.literal('INDIVIDUAL'),
					v.literal('COMPANY'),
					v.literal('GOVERNMENT'),
				),
				document: v.optional(v.string()),
			}),
			lawyers: v.optional(
				v.object({
					plaintiff: v.optional(v.array(v.string())),
					defendant: v.optional(v.array(v.string())),
				}),
			),
		}),
		status: v.union(
			v.literal('ONGOING'),
			v.literal('SUSPENDED'),
			v.literal('ARCHIVED'),
			v.literal('CLOSED'),
		),
		isPublic: v.boolean(), // Public process or under judicial secrecy
		clientId: v.optional(v.id('clients')),
		description: v.optional(v.string()),
		value: v.optional(v.number()), // Process value in cents
		accountId: v.id('accounts'),
		assignedTo: v.optional(v.id('users')), // Assigned lawyer
		createdBy: v.id('users'),
		updatedBy: v.id('users'),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_account', ['accountId'])
		.index('by_case_number', ['caseNumber'])
		.index('by_status', ['accountId', 'status'])
		.index('by_area', ['accountId', 'area'])
		.index('by_assigned', ['assignedTo'])
		.index('by_client', ['clientId'])
		.index('by_tribunal', ['tribunalId'])
		.index('by_created_by', ['createdBy']),

	/**
	 * Deadlines table - Legal deadlines associated with processes
	 * Each deadline belongs to a process and has specific completion requirements
	 */
	deadlines: defineTable({
		processId: v.id('processes'),
		title: v.string(), // Deadline title/description
		taskDescription: v.string(), // What must be done
		deadlineDate: v.number(), // Final date and time (timestamp)
		timeUnit: v.union(v.literal('BUSINESS_DAYS'), v.literal('CALENDAR_DAYS')),
		isExtendable: v.boolean(), // Can this deadline be extended?
		completionStatus: v.union(
			v.literal('PENDING'),
			v.literal('DONE'),
			v.literal('MISSED'),
		),
		priority: v.union(
			v.literal('LOW'),
			v.literal('MEDIUM'),
			v.literal('HIGH'),
			v.literal('CRITICAL'),
		),
		assignedTo: v.optional(v.id('users')), // Assigned lawyer/user
		completedAt: v.optional(v.number()),
		completedBy: v.optional(v.id('users')),
		notes: v.optional(v.string()),
		reminders: v.optional(
			v.array(
				v.object({
					days: v.number(), // Days before deadline
					sentAt: v.optional(v.number()),
				}),
			),
		),
		accountId: v.id('accounts'),
		createdBy: v.id('users'),
		updatedBy: v.id('users'),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_process', ['processId'])
		.index('by_account', ['accountId'])
		.index('by_deadline_date', ['deadlineDate'])
		.index('by_status', ['accountId', 'completionStatus'])
		.index('by_assigned', ['assignedTo'])
		.index('by_priority', ['accountId', 'priority'])
		.index('by_created_by', ['createdBy']),

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
		role: v.union(v.literal('ADMIN'), v.literal('LAWYER')),
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
