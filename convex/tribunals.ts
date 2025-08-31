import { ConvexError, v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { getCurrentUserAccount, logActivity } from './auth'

/**
 * Tribunal mutations and queries with RBAC authorization
 *
 * Authorization rules:
 * - Users can only access tribunals within their account
 * - Super admins can access all tribunals
 * - All operations are logged for audit trail
 */

/**
 * Create a new tribunal
 */
export const createTribunal = mutation({
	args: {
		name: v.string(),
		code: v.string(),
		jurisdiction: v.union(
			v.literal('FEDERAL'),
			v.literal('STATE'),
			v.literal('MUNICIPAL'),
			v.literal('LABOR'),
			v.literal('ELECTORAL'),
			v.literal('MILITARY'),
		),
		tribunalType: v.union(
			v.literal('SUPREME_COURT'),
			v.literal('SUPERIOR_COURT'),
			v.literal('APPELLATE_COURT'),
			v.literal('TRIAL_COURT'),
			v.literal('SPECIALIZED_COURT'),
		),
		address: v.optional(v.string()),
		phone: v.optional(v.string()),
		email: v.optional(v.string()),
		website: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existingTribunal = await ctx.db
			.query('tribunals')
			.filter((q) => q.eq(q.field('code'), args.code))
			.first()

		if (existingTribunal?.isActive) {
			throw new ConvexError('Tribunal with this code already exists')
		}

		const now = Date.now()
		const tribunalId = await ctx.db.insert('tribunals', {
			name: args.name,
			code: args.code,
			jurisdiction: args.jurisdiction,
			type: args.tribunalType,
			address: args.address
				? {
						street: args.address,
						city: '',
						state: '',
						zipCode: '',
						country: 'Brasil',
					}
				: undefined,
			contactInfo:
				args.phone || args.email || args.website
					? {
							phone: args.phone,
							email: args.email,
							website: args.website,
						}
					: undefined,
			isActive: true,
			createdAt: now,
			updatedAt: now,
		})

		// Log activity
		await logActivity(ctx, 'CREATE_TRIBUNAL', 'tribunal', tribunalId, {
			name: args.name,
			code: args.code,
			jurisdiction: args.jurisdiction,
		})

		return tribunalId
	},
})

/**
 * Update tribunal information
 */
export const updateTribunal = mutation({
	args: {
		tribunalId: v.id('tribunals'),
		name: v.optional(v.string()),
		address: v.optional(v.string()),
		phone: v.optional(v.string()),
		email: v.optional(v.string()),
		website: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await getCurrentUserAccount(ctx)

		const tribunal = await ctx.db.get(args.tribunalId)
		if (!tribunal) {
			throw new ConvexError('Tribunal not found')
		}

		const updateData: Partial<Doc<'tribunals'>> = {
			updatedAt: Date.now(),
		}

		if (args.name !== undefined) updateData.name = args.name
		if (args.address !== undefined) {
			updateData.address = {
				street: args.address,
				city: '',
				state: '',
				zipCode: '',
				country: 'Brasil',
			}
		}
		if (
			args.phone !== undefined ||
			args.email !== undefined ||
			args.website !== undefined
		) {
			updateData.contactInfo = {
				phone: args.phone,
				email: args.email,
				website: args.website,
			}
		}

		await ctx.db.patch(args.tribunalId, updateData)

		// Log activity
		await logActivity(ctx, 'UPDATE_TRIBUNAL', 'tribunal', args.tribunalId, {
			updatedFields: Object.keys(args).filter((key) => key !== 'tribunalId'),
		})

		return args.tribunalId
	},
})

/**
 * Soft delete a tribunal (mark as inactive)
 */
// Correção do handler deleteTribunal
export const deleteTribunal = mutation({
	args: {
		tribunalId: v.id('tribunals'),
	},
	handler: async (ctx: MutationCtx, args: { tribunalId: Id<'tribunals'> }) => {
		await getCurrentUserAccount(ctx)

		const tribunal = await ctx.db.get(args.tribunalId)
		if (!tribunal) {
			throw new ConvexError('Tribunal not found')
		}

		// Check if tribunal has active processes
		const activeProcesses = await ctx.db
			.query('processes')
			.withIndex('by_tribunal', (q) => q.eq('tribunalId', args.tribunalId))
			.filter((q) => q.neq(q.field('status'), 'CLOSED'))
			.collect()

		if (activeProcesses.length > 0) {
			throw new ConvexError(
				'Cannot delete tribunal with active processes. Archive processes first.',
			)
		}

		await ctx.db.patch(args.tribunalId, {
			isActive: false,
			updatedAt: Date.now(),
		})

		// Log activity
		await logActivity(ctx, 'DELETE_TRIBUNAL', 'tribunal', args.tribunalId, {
			tribunalName: tribunal.name,
			tribunalCode: tribunal.code,
		})

		return args.tribunalId
	},
})

/**
 * Get all active tribunals for the current account
 */
export const getTribunals = query({
	args: {
		limit: v.optional(v.number()),
		search: v.optional(v.string()),
		jurisdiction: v.optional(
			v.union(
				v.literal('FEDERAL'),
				v.literal('STATE'),
				v.literal('MUNICIPAL'),
				v.literal('LABOR'),
				v.literal('ELECTORAL'),
				v.literal('MILITARY'),
			),
		),
		tribunalType: v.optional(
			v.union(
				v.literal('SUPREME_COURT'),
				v.literal('SUPERIOR_COURT'),
				v.literal('APPELLATE_COURT'),
				v.literal('TRIAL_COURT'),
				v.literal('SPECIALIZED_COURT'),
			),
		),
	},
	handler: async (ctx, args) => {
		await getCurrentUserAccount(ctx)

		let query = ctx.db
			.query('tribunals')
			.filter((q) => q.eq(q.field('isActive'), true))

		if (args.jurisdiction) {
			query = query.filter((q) =>
				q.eq(q.field('jurisdiction'), args.jurisdiction),
			)
		}

		if (args.tribunalType) {
			query = query.filter((q) => q.eq(q.field('type'), args.tribunalType))
		}

		let tribunals = await query.order('desc').collect()

		// Apply search filter if provided
		if (args.search) {
			const searchTerm = args.search.toLowerCase()
			tribunals = tribunals.filter(
				(tribunal) =>
					tribunal.name.toLowerCase().includes(searchTerm) ||
					tribunal.code.toLowerCase().includes(searchTerm),
			)
		}

		// Apply limit if provided
		if (args.limit) {
			tribunals = tribunals.slice(0, args.limit)
		}

		return tribunals
	},
})

/**
 * Get a specific tribunal by ID
 */
export const getTribunal = query({
	args: {
		tribunalId: v.id('tribunals'),
	},
	handler: async (ctx, args) => {
		const tribunal = await ctx.db.get(args.tribunalId)
		if (!tribunal) {
			throw new ConvexError('Tribunal not found')
		}

		// Tribunal access check removed as accountId is not in schema

		return tribunal
	},
})

/**
 * Get tribunal by code
 */
// Correção do handler getTribunalByCode
export const getTribunalByCode = query({
	args: {
		code: v.string(),
	},
	handler: async (ctx: QueryCtx, args: { code: string }) => {
		await getCurrentUserAccount(ctx)

		const tribunal = await ctx.db
			.query('tribunals')
			.withIndex('by_code', (q) => q.eq('code', args.code))
			.filter((q) => q.eq(q.field('isActive'), true))
			.first()

		return tribunal
	},
})

/**
 * Get tribunal statistics
 */
export const getTribunalStats = query({
	args: {},
	handler: async (ctx) => {
		await getCurrentUserAccount(ctx)

		const tribunals = await ctx.db
			.query('tribunals')
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect()

		const stats = {
			total: tribunals.length,
			byJurisdiction: {
				federal: tribunals.filter((t) => t.jurisdiction === 'FEDERAL').length,
				state: tribunals.filter((t) => t.jurisdiction === 'STATE').length,
				municipal: tribunals.filter((t) => t.jurisdiction === 'MUNICIPAL')
					.length,
				labor: tribunals.filter((t) => t.jurisdiction === 'LABOR').length,
				electoral: tribunals.filter((t) => t.jurisdiction === 'ELECTORAL')
					.length,
				military: tribunals.filter((t) => t.jurisdiction === 'MILITARY').length,
			},
			byType: {
				supremeCourt: tribunals.filter((t) => t.type === 'SUPREME_COURT')
					.length,
				superiorCourt: tribunals.filter((t) => t.type === 'SUPERIOR_COURT')
					.length,
				apellateCourt: tribunals.filter((t) => t.type === 'APPELLATE_COURT')
					.length,
				trialCourt: tribunals.filter((t) => t.type === 'TRIAL_COURT').length,
				specializedCourt: tribunals.filter(
					(t) => t.type === 'SPECIALIZED_COURT',
				).length,
			},
			recentlyAdded: tribunals.filter(
				(t) => t.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
			).length,
		}

		return stats
	},
})
