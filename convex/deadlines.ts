import { ConvexError, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import {
	getCurrentUserAccount,
	logActivity,
	requireAccountAccess,
} from './auth'

/**
 * Deadline mutations and queries with RBAC authorization
 *
 * Authorization rules:
 * - Users can only access deadlines within their account
 * - Super admins can access all deadlines
 * - All operations are logged for audit trail
 */

/**
 * Create a new deadline for a process
 */
export const createDeadline = mutation({
	args: {
		processId: v.id('processes'),
		title: v.string(),
		taskDescription: v.string(),
		deadlineDate: v.number(),
		timeUnit: v.union(v.literal('BUSINESS_DAYS'), v.literal('CALENDAR_DAYS')),
		isExtendable: v.optional(v.boolean()),
		priority: v.optional(
			v.union(
				v.literal('LOW'),
				v.literal('MEDIUM'),
				v.literal('HIGH'),
				v.literal('CRITICAL'),
			),
		),
		assignedTo: v.optional(v.id('users')),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { user, account } = await getCurrentUserAccount(ctx)

		const process = await ctx.db.get(args.processId)

		if (!process) {
			throw new ConvexError('Process not found')
		}

		await requireAccountAccess(ctx, process.accountId)

		const now = Date.now()
		const deadlineId = await ctx.db.insert('deadlines', {
			processId: args.processId,
			title: args.title,
			taskDescription: args.taskDescription,
			deadlineDate: args.deadlineDate,
			timeUnit: args.timeUnit,
			isExtendable: args.isExtendable ?? false,
			completionStatus: 'PENDING',
			priority: args.priority ?? 'MEDIUM',
			assignedTo: args.assignedTo,
			notes: args.notes,
			accountId: account._id,
			createdBy: user._id,
			updatedBy: user._id,
			createdAt: now,
			updatedAt: now,
		})

		await logActivity(ctx, 'CREATE_DEADLINE', 'deadline', deadlineId, {
			processId: args.processId,
			title: args.title,
			priority: args.priority ?? 'MEDIUM',
		})

		return deadlineId
	},
})

/**
 * Update deadline completion status
 */
export const updateDeadlineStatus = mutation({
	args: {
		deadlineId: v.id('deadlines'),
		completionStatus: v.union(
			v.literal('PENDING'),
			v.literal('DONE'),
			v.literal('MISSED'),
		),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { user } = await getCurrentUserAccount(ctx)

		const deadline = await ctx.db.get(args.deadlineId)
		if (!deadline) {
			throw new ConvexError('Deadline not found')
		}

		await requireAccountAccess(ctx, deadline.accountId)

		const updateData: Partial<Doc<'deadlines'>> = {
			completionStatus: args.completionStatus,
			updatedBy: user._id,
			updatedAt: Date.now(),
		}

		if (args.completionStatus === 'DONE') {
			updateData.completedAt = Date.now()
			updateData.completedBy = user._id
		}

		if (args.notes !== undefined) {
			updateData.notes = args.notes
		}

		await ctx.db.patch(args.deadlineId, updateData)

		// Log activity
		await logActivity(
			ctx,
			'UPDATE_DEADLINE_STATUS',
			'deadline',
			args.deadlineId,
			{
				completionStatus: args.completionStatus,
				processId: deadline.processId,
			},
		)

		return args.deadlineId
	},
})

/**
 * Get deadlines for a specific process
 */
export const getProcessDeadlines = query({
	args: {
		processId: v.id('processes'),
	},
	handler: async (ctx, args) => {
		// Verify process exists and user has access
		const process = await ctx.db.get(args.processId)
		if (!process) {
			throw new ConvexError('Process not found')
		}

		await requireAccountAccess(ctx, process.accountId)

		return await ctx.db
			.query('deadlines')
			.withIndex('by_process', (q) => q.eq('processId', args.processId))
			.collect()
	},
})

/**
 * Get upcoming deadlines for the current user's account
 */
export const getUpcomingDeadlines = query({
	args: {
		limit: v.optional(v.number()),
		daysAhead: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { account } = await getCurrentUserAccount(ctx)

		const limit = args.limit ?? 10
		const daysAhead = args.daysAhead ?? 30
		const maxDate = Date.now() + daysAhead * 24 * 60 * 60 * 1000

		const deadlines = await ctx.db
			.query('deadlines')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.filter((q) =>
				q.and(
					q.eq(q.field('completionStatus'), 'PENDING'),
					q.lte(q.field('deadlineDate'), maxDate),
				),
			)
			.order('asc')
			.take(limit)

		return deadlines
	},
})

/**
 * Get deadlines assigned to current user
 */
export const getMyDeadlines = query({
	args: {
		status: v.optional(
			v.union(v.literal('PENDING'), v.literal('DONE'), v.literal('MISSED')),
		),
	},
	handler: async (ctx, args) => {
		const { user } = await getCurrentUserAccount(ctx)

		let query = ctx.db
			.query('deadlines')
			.withIndex('by_assigned', (q) => q.eq('assignedTo', user._id))

		if (args.status) {
			query = query.filter((q) =>
				q.eq(q.field('completionStatus'), args.status),
			)
		}

		return await query.order('asc').collect()
	},
})

/**
 * Get deadline statistics
 */
export const getDeadlineStats = query({
	args: {},
	handler: async (ctx) => {
		const { account } = await getCurrentUserAccount(ctx)

		const deadlines = await ctx.db
			.query('deadlines')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()

		const now = Date.now()
		const stats = {
			total: deadlines.length,
			pending: deadlines.filter((d) => d.completionStatus === 'PENDING').length,
			done: deadlines.filter((d) => d.completionStatus === 'DONE').length,
			missed: deadlines.filter((d) => d.completionStatus === 'MISSED').length,
			overdue: deadlines.filter(
				(d) => d.completionStatus === 'PENDING' && d.deadlineDate < now,
			).length,
			upcoming: deadlines.filter(
				(d) =>
					d.completionStatus === 'PENDING' &&
					d.deadlineDate >= now &&
					d.deadlineDate <= now + 7 * 24 * 60 * 60 * 1000, // Next 7 days
			).length,
			byPriority: {
				low: deadlines.filter((d) => d.priority === 'LOW').length,
				medium: deadlines.filter((d) => d.priority === 'MEDIUM').length,
				high: deadlines.filter((d) => d.priority === 'HIGH').length,
				critical: deadlines.filter((d) => d.priority === 'CRITICAL').length,
			},
		}

		return stats
	},
})
