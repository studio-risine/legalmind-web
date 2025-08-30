import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import {
	getCurrentUserAccount,
	logActivity,
	requireProductAccess,
	validateAccountLimits,
} from './auth'

/**
 * Product mutations and queries with RBAC authorization
 *
 * Authorization rules:
 * - Users can only access products within their account
 * - Super admins can access all products
 * - Account limits are enforced when creating products
 * - All operations are logged for audit trail
 */

/**
 * Create a new product
 * Requires: User must be member of an account
 * Validates: Account product limits
 */
export const createProduct = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		category: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		imageUrl: v.optional(v.string()),
		images: v.optional(v.array(v.string())),
		price: v.number(),
		currency: v.string(),
		compareAtPrice: v.optional(v.number()),
		sku: v.optional(v.string()),
		trackInventory: v.optional(v.boolean()),
		inventoryQuantity: v.optional(v.number()),
		allowBackorder: v.optional(v.boolean()),
		status: v.optional(
			v.union(v.literal('DRAFT'), v.literal('ACTIVE'), v.literal('ARCHIVED')),
		),
		featured: v.optional(v.boolean()),
		metaTitle: v.optional(v.string()),
		metaDescription: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { user, account } = await getCurrentUserAccount(ctx)

		await validateAccountLimits(ctx, account._id, 'products')

		const existingProduct = await ctx.db
			.query('products')
			.withIndex('by_slug', (q) =>
				q.eq('accountId', account._id).eq('slug', args.slug),
			)
			.unique()

		if (existingProduct) {
			throw new ConvexError(
				`Product with slug '${args.slug}' already exists in this account`,
			)
		}

		if (args.price < 0) {
			throw new ConvexError('Price must be greater than or equal to 0')
		}

		if (args.compareAtPrice && args.compareAtPrice <= args.price) {
			throw new ConvexError(
				'Compare at price must be greater than the regular price',
			)
		}

		if (args.trackInventory && args.inventoryQuantity === undefined) {
			throw new ConvexError(
				'Inventory quantity is required when tracking inventory',
			)
		}

		const now = Date.now()

		const productId = await ctx.db.insert('products', {
			name: args.name,
			slug: args.slug,
			description: args.description,
			category: args.category,
			tags: args.tags || [],
			imageUrl: args.imageUrl,
			images: args.images || [],
			price: args.price,
			currency: args.currency,
			compareAtPrice: args.compareAtPrice,
			sku: args.sku,
			trackInventory: args.trackInventory || false,
			inventoryQuantity: args.inventoryQuantity,
			allowBackorder: args.allowBackorder || false,
			status: args.status || 'DRAFT',
			featured: args.featured || false,
			metaTitle: args.metaTitle,
			metaDescription: args.metaDescription,
			accountId: account._id,
			createdBy: user._id,
			updatedBy: user._id,
			createdAt: now,
			updatedAt: now,
		})

		await logActivity(ctx, 'product.created', 'product', productId, {
			productName: args.name,
			productSlug: args.slug,
		})

		return productId
	},
})

/**
 * Update an existing product
 * Requires: User must have access to the product
 */
export const updateProduct = mutation({
	args: {
		productId: v.id('products'),
		name: v.optional(v.string()),
		slug: v.optional(v.string()),
		description: v.optional(v.string()),
		category: v.optional(v.string()),
		tags: v.optional(v.array(v.string())),
		imageUrl: v.optional(v.string()),
		images: v.optional(v.array(v.string())),
		price: v.optional(v.number()),
		currency: v.optional(v.string()),
		compareAtPrice: v.optional(v.number()),
		sku: v.optional(v.string()),
		trackInventory: v.optional(v.boolean()),
		inventoryQuantity: v.optional(v.number()),
		allowBackorder: v.optional(v.boolean()),
		status: v.optional(
			v.union(v.literal('DRAFT'), v.literal('ACTIVE'), v.literal('ARCHIVED')),
		),
		featured: v.optional(v.boolean()),
		metaTitle: v.optional(v.string()),
		metaDescription: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { user, product } = await requireProductAccess(ctx, args.productId)

		const { productId: _, ...updates } = args

		const hasChanges = Object.keys(updates).some(
			(key) =>
				updates[key as keyof typeof updates] !== undefined &&
				updates[key as keyof typeof updates] !==
					product[key as keyof typeof product],
		)

		if (!hasChanges) {
			return product
		}

		if (updates.slug && updates.slug !== product.slug) {
			const existingProduct = await ctx.db
				.query('products')
				.withIndex('by_slug', (q) =>
					q.eq('accountId', product.accountId).eq('slug', updates.slug!),
				)
				.unique()

			if (existingProduct) {
				throw new ConvexError(
					`Product with slug '${updates.slug}' already exists in this account`,
				)
			}
		}

		if (updates.price !== undefined && updates.price < 0) {
			throw new ConvexError('Price must be greater than or equal to 0')
		}

		const finalPrice = updates.price ?? product.price
		const finalCompareAtPrice = updates.compareAtPrice ?? product.compareAtPrice

		if (finalCompareAtPrice && finalCompareAtPrice <= finalPrice) {
			throw new ConvexError(
				'Compare at price must be greater than the regular price',
			)
		}

		const finalTrackInventory = updates.trackInventory ?? product.trackInventory
		const finalInventoryQuantity =
			updates.inventoryQuantity ?? product.inventoryQuantity

		if (finalTrackInventory && finalInventoryQuantity === undefined) {
			throw new ConvexError(
				'Inventory quantity is required when tracking inventory',
			)
		}

		const updatedProduct = {
			...product,
			...updates,
			updatedBy: user._id,
			updatedAt: Date.now(),
		}

		await ctx.db.patch(args.productId, updatedProduct)

		const updatedFields = Object.keys(updates).filter(
			(key) => updates[key as keyof typeof updates] !== undefined,
		)

		await logActivity(ctx, 'product.updated', 'product', args.productId, {
			productName: updatedProduct.name,
			updatedFields,
			changes: updates,
		})

		return updatedProduct
	},
})

/**
 * Delete a product
 * Requires: User must have access to the product
 */
export const deleteProduct = mutation({
	args: {
		productId: v.id('products'),
	},
	handler: async (ctx, args) => {
		const { product } = await requireProductAccess(ctx, args.productId)

		await ctx.db.delete(args.productId)

		await logActivity(ctx, 'product.deleted', 'product', args.productId, {
			productName: product.name,
			productSlug: product.slug,
		})

		return { success: true }
	},
})

/**
 * Update product inventory
 * Requires: User must have access to the product
 */
export const updateProductInventory = mutation({
	args: {
		productId: v.id('products'),
		quantity: v.number(),
		operationType: v.union(
			v.literal('SET'),
			v.literal('ADD'),
			v.literal('SUBTRACT'),
		),
	},
	handler: async (ctx, args) => {
		const { user, product } = await requireProductAccess(ctx, args.productId)

		if (!product.trackInventory) {
			throw new ConvexError('This product does not track inventory')
		}

		let newQuantity: number
		const currentQuantity = product.inventoryQuantity || 0

		switch (args.operationType) {
			case 'SET':
				newQuantity = args.quantity
				break
			case 'ADD':
				newQuantity = currentQuantity + args.quantity
				break
			case 'SUBTRACT':
				newQuantity = currentQuantity - args.quantity
				break
		}

		if (newQuantity < 0) {
			throw new ConvexError('Inventory quantity cannot be negative')
		}

		await ctx.db.patch(args.productId, {
			inventoryQuantity: newQuantity,
			updatedBy: user._id,
			updatedAt: Date.now(),
		})

		await logActivity(
			ctx,
			'product.inventory_updated',
			'product',
			args.productId,
			{
				productName: product.name,
				operationType: args.operationType,
				quantityChange: args.quantity,
				previousQuantity: currentQuantity,
				newQuantity,
			},
		)

		return { newQuantity }
	},
})

/**
 * Get all products for the current user's account
 * Supports filtering and pagination
 */
export const getProducts = query({
	args: {
		status: v.optional(
			v.union(v.literal('DRAFT'), v.literal('ACTIVE'), v.literal('ARCHIVED')),
		),
		category: v.optional(v.string()),
		featured: v.optional(v.boolean()),
		limit: v.optional(v.number()),
		offset: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { account } = await getCurrentUserAccount(ctx)

		let query = ctx.db
			.query('products')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))

		// Apply filters
		if (args.status) {
			query = ctx.db
				.query('products')
				.withIndex('by_status', (q) =>
					q.eq('accountId', account._id).eq('status', args.status!),
				)
		}

		if (args.category) {
			query = ctx.db
				.query('products')
				.withIndex('by_category', (q) =>
					q.eq('accountId', account._id).eq('category', args.category!),
				)
		}

		if (args.featured !== undefined) {
			query = ctx.db
				.query('products')
				.withIndex('by_featured', (q) =>
					q.eq('accountId', account._id).eq('featured', args.featured!),
				)
		}

		let products = await query.collect()

		if (args.offset) {
			products = products.slice(args.offset)
		}

		if (args.limit) {
			products = products.slice(0, args.limit)
		}

		return products
	},
})

/**
 * Get a single product by ID
 * Requires: User must have access to the product
 */
export const getProduct = query({
	args: {
		productId: v.id('products'),
	},
	handler: async (ctx, args) => {
		const { product } = await requireProductAccess(ctx, args.productId)
		return product
	},
})

/**
 * Get a product by slug within the current user's account
 */
export const getProductBySlug = query({
	args: {
		slug: v.string(),
	},
	handler: async (ctx, args) => {
		const { account } = await getCurrentUserAccount(ctx)

		const product = await ctx.db
			.query('products')
			.withIndex('by_slug', (q) =>
				q.eq('accountId', account._id).eq('slug', args.slug),
			)
			.unique()

		if (!product) {
			throw new ConvexError('Product not found')
		}

		return product
	},
})

/**
 * Get product categories for the current user's account
 */
export const getProductCategories = query({
	args: {},
	handler: async (ctx) => {
		const { account } = await getCurrentUserAccount(ctx)

		const products = await ctx.db
			.query('products')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()

		// Extract unique categories
		const categories = [
			...new Set(
				products
					.map((product) => product.category)
					.filter((category) => category !== undefined && category !== ''),
			),
		]

		return categories.sort()
	},
})

/**
 * Get product statistics for the current user's account
 */
export const getProductStats = query({
	args: {},
	handler: async (ctx) => {
		const { account } = await getCurrentUserAccount(ctx)

		const products = await ctx.db
			.query('products')
			.withIndex('by_account', (q) => q.eq('accountId', account._id))
			.collect()

		const stats = {
			total: products.length,
			active: products.filter((p) => p.status === 'ACTIVE').length,
			draft: products.filter((p) => p.status === 'DRAFT').length,
			archived: products.filter((p) => p.status === 'ARCHIVED').length,
			featured: products.filter((p) => p.featured).length,
			trackingInventory: products.filter((p) => p.trackInventory).length,
			lowStock: products.filter(
				(p) =>
					p.trackInventory &&
					p.inventoryQuantity !== undefined &&
					p.inventoryQuantity < 10,
			).length,
			outOfStock: products.filter(
				(p) =>
					p.trackInventory &&
					p.inventoryQuantity !== undefined &&
					p.inventoryQuantity === 0,
			).length,
		}

		return stats
	},
})
