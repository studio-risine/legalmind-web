import { ConvexError, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import {
	getCurrentUserAccount,
	logActivity,
	requireAccountAccess,
} from './auth'

/**
 * Client mutations and queries with RBAC authorization
 *
 * Authorization rules:
 * - Users can only access clients within their account
 * - Super admins can access all clients
 * - All operations are logged for audit trail
 */

/**
 * Create a new client
 */
export const createClient = mutation({
	args: {
		name: v.string(),
		document: v.string(),
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
		address: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { user, account } = await getCurrentUserAccount(ctx)

		const existingClient = await ctx.db
			.query('clients')
			.withIndex('by_document', (q) => q.eq('document', args.document))
			.filter((q) => q.eq(q.field('accountId'), account._id))
			.unique()

		if (existingClient?.isActive) {
			throw new ConvexError('Client with this document already exists')
		}

		const now = Date.now()
		const clientId = await ctx.db.insert('clients', {
			name: args.name,
			document: args.document,
			documentType: args.documentType as 'CPF' | 'CNPJ' | 'OTHER',
			clientType: args.clientType as 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT',
			email: args.email,
			phone: args.phone,
			address: args.address
				? {
						street: args.address,
						city: '',
						state: '',
						zipCode: '',
						country: 'Brazil',
					}
				: undefined,
			notes: args.notes,
			isActive: true,
			accountId: account._id,
			createdBy: user._id,
			updatedBy: user._id,
			createdAt: now,
			updatedAt: now,
		})

		// Log activity
		await logActivity(ctx, 'CREATE_CLIENT', 'client', clientId, {
			name: args.name,
			document: args.document,
			clientType: args.clientType,
		})

		return clientId
	},
})

/**
 * Update client information
 */
export const updateClient = mutation({
	args: {
		clientId: v.id('clients'),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		address: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { user } = await getCurrentUserAccount(ctx)

		const client = await ctx.db.get(args.clientId)
		if (!client) {
			throw new ConvexError('Client not found')
		}

		await requireAccountAccess(ctx, client.accountId)

		const updates: Partial<Doc<'clients'>> = {}

		if (args.name !== undefined && args.name !== client.name) {
			updates.name = args.name
		}
		if (args.email !== undefined && args.email !== client.email) {
			updates.email = args.email
		}
		if (args.phone !== undefined && args.phone !== client.phone) {
			updates.phone = args.phone
		}
		if (args.notes !== undefined && args.notes !== client.notes) {
			updates.notes = args.notes
		}

		if (args.address !== undefined) {
			updates.address = {
				street: args.address,
				city: '',
				state: '',
				zipCode: '',
				country: 'Brazil',
			}
		}

		const hasChanges = Object.keys(updates).length > 0

		if (hasChanges) {
			updates.updatedBy = user._id
			updates.updatedAt = Date.now()

			await ctx.db.patch(args.clientId, updates)

			await logActivity(ctx, 'UPDATE_CLIENT', 'client', args.clientId, {
				updatedFields: Object.keys(updates).filter(
					(key) => key !== 'updatedBy' && key !== 'updatedAt',
				),
			})
		}

		return args.clientId
	},
})

/**
 * Soft delete a client (mark as inactive)
 */
export const deleteClient = mutation({
	args: {
		clientId: v.id('clients'),
	},
	handler: async (ctx, args) => {
		const { user } = await getCurrentUserAccount(ctx)

		const client = await ctx.db.get(args.clientId)

		if (!client) {
			throw new ConvexError('Client not found')
		}

		await requireAccountAccess(ctx, client.accountId)

		// Check if client has any active processes
		const activeProcesses = await ctx.db
			.query('processes')
			.withIndex('by_client', (q) => q.eq('clientId', args.clientId))
			.filter((q) => q.neq(q.field('status'), 'CLOSED'))
			.collect()

		if (activeProcesses.length > 0) {
			throw new ConvexError(
				`Cannot delete client with ${activeProcesses.length} active processes`,
			)
		}

		await ctx.db.patch(args.clientId, {
			isActive: false,
			updatedBy: user._id,
			updatedAt: Date.now(),
		})

		// Log activity
		await logActivity(ctx, 'DELETE_CLIENT', 'client', args.clientId, {
			name: client.name,
			document: client.document,
		})

		return args.clientId
	},
})

/**
 * Get all active clients for the current account
 */
export const getClients = query({
	args: {
		limit: v.optional(v.number()),
		search: v.optional(v.string()),
		clientType: v.optional(
			v.union(
				v.literal('INDIVIDUAL'),
				v.literal('COMPANY'),
				v.literal('GOVERNMENT'),
			),
		),
	},
	handler: async (ctx, args) => {
		const { account } = await getCurrentUserAccount(ctx)

		let query = ctx.db
			.query('clients')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.filter((q) => q.eq(q.field('isActive'), true))

		if (args.clientType) {
			query = query.filter((q) => q.eq(q.field('clientType'), args.clientType))
		}

		let clients = await query.order('desc').collect()

		if (args.search) {
			const searchTerm = args.search.toLowerCase()
			clients = clients.filter(
				(client) =>
					client.name.toLowerCase().includes(searchTerm) ||
					client.document.includes(searchTerm) ||
					client.email?.toLowerCase().includes(searchTerm),
			)
		}

		if (args.limit) {
			clients = clients.slice(0, args.limit)
		}

		return clients
	},
})

/**
 * Get a specific client by ID
 */
export const getClient = query({
	args: {
		clientId: v.id('clients'),
	},
	handler: async (ctx, args) => {
		const client = await ctx.db.get(args.clientId)
		if (!client) {
			throw new ConvexError('Client not found')
		}

		await requireAccountAccess(ctx, client.accountId)

		return client
	},
})

/**
 * Get client statistics
 */
export const getClientStats = query({
	args: {},
	handler: async (ctx) => {
		const { account } = await getCurrentUserAccount(ctx)

		const clients = await ctx.db
			.query('clients')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.filter((q) => q.eq(q.field('isActive'), true))
			.collect()

		const stats = {
			total: clients.length,
			byType: {
				individual: clients.filter(
					({ clientType }) => clientType === 'INDIVIDUAL',
				).length,
				company: clients.filter(({ clientType }) => clientType === 'COMPANY')
					.length,
				government: clients.filter(
					({ clientType }) => clientType === 'GOVERNMENT',
				).length,
			},
			byDocumentType: {
				cpf: clients.filter(({ documentType }) => documentType === 'CPF')
					.length,
				cnpj: clients.filter(({ documentType }) => documentType === 'CNPJ')
					.length,
				other: clients.filter(({ documentType }) => documentType === 'OTHER')
					.length,
			},
			recentlyAdded: clients.filter(
				(c) => c.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
			).length,
		}

		return stats
	},
})
