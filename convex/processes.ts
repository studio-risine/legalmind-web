import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import {
	getCurrentUserAccount,
	logActivity,
	requireAccountAccess,
	validateAccountLimits,
} from './auth'

/**
 * Process mutations and queries with RBAC authorization
 *
 * Authorization rules:
 * - Users can only access processes within their account
 * - Super admins can access all processes
 * - Account limits are enforced when creating processes
 * - All operations are logged for audit trail
 */

/**
 * Create a new legal process
 * Requires: User must be member of an account
 * Validates: Account process limits
 */
export const createProcess = mutation({
	args: {
		caseNumber: v.string(),
		court: v.string(),
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
		type: v.optional(v.string()),
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
		status: v.optional(
			v.union(
				v.literal('ONGOING'),
				v.literal('SUSPENDED'),
				v.literal('ARCHIVED'),
				v.literal('CLOSED'),
			),
		),
		isPublic: v.optional(v.boolean()),
		clientId: v.optional(v.id('clients')),
		description: v.optional(v.string()),
		value: v.optional(v.number()),
		assignedTo: v.optional(v.id('users')),
	},
	handler: async (ctx, args) => {
		const { user, account } = await getCurrentUserAccount(ctx)

		const existingProcess = await ctx.db
			.query('processes')
			.withIndex('by_case_number', (q) => q.eq('caseNumber', args.caseNumber))
			.first()

		if (existingProcess) {
			throw new ConvexError('Case number already exists')
		}

		await validateAccountLimits(ctx, account._id, 'products')

		const now = Date.now()
		const processId = await ctx.db.insert('processes', {
			caseNumber: args.caseNumber,
			court: args.court,
			tribunalId: args.tribunalId,
			area: args.area,
			type: args.type,
			parties: args.parties,
			status: args.status ?? 'ONGOING',
			isPublic: args.isPublic ?? true,
			clientId: args.clientId,
			description: args.description,
			value: args.value,
			accountId: account._id,
			assignedTo: args.assignedTo,
			createdBy: user._id,
			updatedBy: user._id,
			createdAt: now,
			updatedAt: now,
		})

		await logActivity(ctx, 'CREATE_PROCESS', 'process', processId, {
			caseNumber: args.caseNumber,
			area: args.area,
		})

		return processId
	},
})

/**
 * Update an existing process
 * Requires: User must have access to the process
 */
export const updateProcess = mutation({
	args: {
		processId: v.id('processes'),
		court: v.optional(v.string()),
		tribunalId: v.optional(v.id('tribunals')),
		area: v.optional(
			v.union(
				v.literal('CIVIL'),
				v.literal('LABOR'),
				v.literal('CRIMINAL'),
				v.literal('FAMILY'),
				v.literal('TAX'),
				v.literal('ADMINISTRATIVE'),
				v.literal('CONSTITUTIONAL'),
				v.literal('INTERNATIONAL'),
			),
		),
		type: v.optional(v.string()),
		parties: v.optional(
			v.object({
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
		),
		status: v.optional(
			v.union(
				v.literal('ONGOING'),
				v.literal('SUSPENDED'),
				v.literal('ARCHIVED'),
				v.literal('CLOSED'),
			),
		),
		isPublic: v.optional(v.boolean()),
		clientId: v.optional(v.id('clients')),
		description: v.optional(v.string()),
		value: v.optional(v.number()),
		assignedTo: v.optional(v.id('users')),
	},
	handler: async (ctx, args) => {
		const { user } = await getCurrentUserAccount(ctx)

		const existingProcess = await ctx.db.get(args.processId)

		if (!existingProcess) {
			throw new ConvexError('Process not found')
		}

		await requireAccountAccess(ctx, existingProcess.accountId)

		await ctx.db.patch(args.processId, {
			...existingProcess,
			...args,
			updatedBy: user._id,
			updatedAt: Date.now(),
		})

		await logActivity(ctx, 'UPDATE_PROCESS', 'process', args.processId, {
			updatedFields: Object.keys(args).filter((key) => key !== 'processId'),
		})

		return args.processId
	},
})

/**
 * Delete a process (soft delete)
 * Requires: Admin role
 */
export const deleteProcess = mutation({
	args: {
		processId: v.id('processes'),
	},
	handler: async (ctx, args) => {
		const { user } = await getCurrentUserAccount(ctx)

		if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
			throw new ConvexError('Insufficient permissions to delete process')
		}

		const process = await ctx.db.get(args.processId)
		if (!process) {
			throw new ConvexError('Process not found')
		}

		await requireAccountAccess(ctx, process.accountId)

		await ctx.db.patch(args.processId, {
			status: 'ARCHIVED',
			updatedBy: user._id,
			updatedAt: Date.now(),
		})

		// Log activity
		await logActivity(ctx, 'DELETE_PROCESS', 'process', args.processId, {
			caseNumber: process.caseNumber,
		})
	},
})

/**
 * Get processes for the current user's account
 * Supports filtering and pagination
 */
export const getProcesses = query({
	args: {
		status: v.optional(
			v.union(
				v.literal('ONGOING'),
				v.literal('SUSPENDED'),
				v.literal('ARCHIVED'),
				v.literal('CLOSED'),
			),
		),
		area: v.optional(
			v.union(
				v.literal('CIVIL'),
				v.literal('LABOR'),
				v.literal('CRIMINAL'),
				v.literal('FAMILY'),
				v.literal('TAX'),
				v.literal('ADMINISTRATIVE'),
				v.literal('CONSTITUTIONAL'),
				v.literal('INTERNATIONAL'),
			),
		),
		assignedTo: v.optional(v.id('users')),
		clientId: v.optional(v.id('clients')),
		limit: v.optional(v.number()),
		offset: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { account } = await getCurrentUserAccount(ctx)

		let query = ctx.db
			.query('processes')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))

		if (args.status) {
			query = ctx.db
				.query('processes')
				.withIndex('by_status', (q) =>
					q.eq('accountId', account._id).eq('status', args.status!),
				)
		}

		if (args.area) {
			query = ctx.db
				.query('processes')
				.withIndex('by_area', (q) =>
					q.eq('accountId', account._id).eq('area', args.area!),
				)
		}

		if (args.assignedTo) {
			query = ctx.db
				.query('processes')
				.withIndex('by_assigned', (q) => q.eq('assignedTo', args.assignedTo))
		}

		if (args.clientId) {
			query = ctx.db
				.query('processes')
				.withIndex('by_client', (q) => q.eq('clientId', args.clientId))
		}

		// Apply pagination
		if (args.offset) {
			const results = await query.collect()
			const offset = args.offset
			const limit = args.limit ?? 25
			return results.slice(offset, offset + limit)
		}

		if (args.limit) {
			const results = await query.collect()
			return results.slice(0, args.limit)
		}

		return await query.collect()
	},
})

/**
 * Get a single process by ID
 */
export const getProcess = query({
	args: {
		processId: v.id('processes'),
	},
	handler: async (ctx, args) => {
		const process = await ctx.db.get(args.processId)
		if (!process) {
			throw new ConvexError('Process not found')
		}

		await requireAccountAccess(ctx, process.accountId)
		return process
	},
})

/**
 * Get process by case number
 */
export const getProcessByCaseNumber = query({
	args: {
		caseNumber: v.string(),
	},
	handler: async (ctx, args) => {
		const { account } = await getCurrentUserAccount(ctx)

		const process = await ctx.db
			.query('processes')
			.withIndex('by_case_number', (q) => q.eq('caseNumber', args.caseNumber))
			.first()

		if (!process) {
			return null
		}

		// Ensure user has access to this process
		if (process.accountId !== account._id) {
			throw new ConvexError('Access denied')
		}

		return process
	},
})

/**
 * Get process statistics for dashboard
 */
export const getProcessStats = query({
	args: {},
	handler: async (ctx) => {
		const { account } = await getCurrentUserAccount(ctx)

		const processes = await ctx.db
			.query('processes')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()

		const stats = {
			total: processes.length,
			ongoing: processes.filter((p) => p.status === 'ONGOING').length,
			suspended: processes.filter((p) => p.status === 'SUSPENDED').length,
			archived: processes.filter((p) => p.status === 'ARCHIVED').length,
			closed: processes.filter((p) => p.status === 'CLOSED').length,
			byArea: {} as Record<string, number>,
		}

		processes.forEach((process: Doc<'processes'>) => {
			stats.byArea[process.area] = (stats.byArea[process.area] || 0) + 1
		})

		return stats
	},
})
