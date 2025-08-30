import { faker } from '@faker-js/faker'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import type { DatabaseWriter, MutationCtx } from './_generated/server'
import { internalMutation } from './_generated/server'

/**
 * Seed script to populate the database with fake data for development and testing.
 *
 * This script creates:
 * - A super admin user with password "123456"
 * - Multiple accounts with different plans
 * - Users for each account with different roles
 * - Products for each account
 * - Activity logs
 *
 * Usage:
 * - From CLI: npx convex run seed:populateDatabase
 * - From dashboard: Run the populateDatabase function
 */

/**
 * Main seed function that populates the entire database
 */
export const populateDatabase = internalMutation({
	args: {
		clearExisting: v.optional(v.boolean()),
		accountsCount: v.optional(v.number()),
		usersPerAccount: v.optional(v.number()),
		productsPerAccount: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const {
			clearExisting = false,
			accountsCount = 5,
			usersPerAccount = 3,
			productsPerAccount = 10,
		} = args

		// Set a consistent seed for reproducible results
		faker.seed(123)

		console.log('🌱 Starting database seeding...')

		if (clearExisting) {
			console.log('🗑️ Clearing existing data...')
			await clearDatabase(ctx)
		}

		console.log('👑 Creating super admin user...')
		const superAdminId = await createSuperAdmin(ctx)

		console.log(`🏢 Creating ${accountsCount} accounts...`)
		const accountIds = []

		for (let i = 0; i < accountsCount; i++) {
			const accountId = await createAccount(ctx, superAdminId)
			accountIds.push(accountId)

			// Create users for this account
			console.log(
				`👥 Creating ${usersPerAccount} users for account ${i + 1}...`,
			)
			const userIds = []
			for (let j = 0; j < usersPerAccount; j++) {
				const userId = await createUser(
					ctx,
					accountId,
					j === 0 ? 'ADMIN' : 'MEMBER',
				)
				userIds.push(userId)
			}

			// Create products for this account
			console.log(
				`📦 Creating ${productsPerAccount} products for account ${i + 1}...`,
			)
			for (let k = 0; k < productsPerAccount; k++) {
				await createProduct(ctx, accountId, userIds[0]) // Created by account admin
			}
		}

		console.log('✅ Database seeding completed successfully!')
		console.log('📊 Summary:')
		console.log('   - 1 Super Admin user')
		console.log(`   - ${accountsCount} Accounts`)
		console.log(`   - ${accountsCount * usersPerAccount} Users`)
		console.log(`   - ${accountsCount * productsPerAccount} Products`)
	},
})

/**
 * Clear all data from the database
 */
async function clearDatabase(ctx: { db: DatabaseWriter }) {
	const activityLogs = await ctx.db.query('activityLogs').collect()
	for (const log of activityLogs) {
		await ctx.db.delete(log._id)
	}

	const invitations = await ctx.db.query('invitations').collect()
	for (const invitation of invitations) {
		await ctx.db.delete(invitation._id)
	}

	const products = await ctx.db.query('products').collect()
	for (const product of products) {
		await ctx.db.delete(product._id)
	}

	const users = await ctx.db.query('users').collect()
	for (const user of users) {
		await ctx.db.delete(user._id)
	}

	const accounts = await ctx.db.query('accounts').collect()
	for (const account of accounts) {
		await ctx.db.delete(account._id)
	}
}

/**
 * Create a super admin user with password "123456"
 */
async function createSuperAdmin(ctx: { db: DatabaseWriter }) {
	const now = Date.now()
	const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com'
	const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123'

	const superAdminId = await ctx.db.insert('users', {
		email: superAdminEmail,
		name: 'Super Administrator',
		avatarUrl: faker.image.avatar(),
		role: 'SUPER_ADMIN',
		isActive: true,
		lastLoginAt: now,
		createdAt: now,
		updatedAt: now,
	})

	console.log(
		`👑 Super Admin created: ${superAdminEmail} (password: ${superAdminPassword})`,
	)
	return superAdminId
}

/**
 * Create a fake account
 */
async function createAccount(
	ctx: { db: DatabaseWriter },
	_createdBy: Id<'users'>,
) {
	const now = Date.now()
	const companyName = faker.company.name()
	const plans = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'] as const
	const plan = faker.helpers.arrayElement(plans)

	// Plan-based limits
	const planLimits = {
		FREE: { maxUsers: 3, maxProducts: 10 },
		BASIC: { maxUsers: 10, maxProducts: 50 },
		PRO: { maxUsers: 25, maxProducts: 200 },
		ENTERPRISE: { maxUsers: 100, maxProducts: 1000 },
	}

	const accountId = await ctx.db.insert('accounts', {
		name: companyName,
		slug: faker.helpers.slugify(companyName).toLowerCase(),
		description: faker.company.catchPhrase(),
		logoUrl: faker.image.url({ width: 200, height: 200 }),
		primaryColor: faker.color.rgb(),
		website: faker.internet.url(),
		contactEmail: faker.internet.email(),
		phone: faker.phone.number(),
		address: {
			street: faker.location.streetAddress(),
			city: faker.location.city(),
			state: faker.location.state(),
			zipCode: faker.location.zipCode(),
			country: faker.location.country(),
		},
		plan,
		maxUsers: planLimits[plan].maxUsers,
		maxProducts: planLimits[plan].maxProducts,
		isActive: true,
		createdAt: now,
		updatedAt: now,
	})

	return accountId
}

/**
 * Create a fake user for an account
 */
async function createUser(
	ctx: { db: DatabaseWriter },
	accountId: Id<'accounts'>,
	role: 'ADMIN' | 'MEMBER',
) {
	const now = Date.now()
	const firstName = faker.person.firstName()
	const lastName = faker.person.lastName()

	const userId = await ctx.db.insert('users', {
		email: faker.internet.email({ firstName, lastName }),
		name: `${firstName} ${lastName}`,
		avatarUrl: faker.image.avatar(),
		accountId,
		role,
		isActive: faker.datatype.boolean(0.9), // 90% active
		lastLoginAt: faker.date.recent({ days: 30 }).getTime(),
		createdAt: now,
		updatedAt: now,
	})

	return userId
}

/**
 * Create a fake product for an account
 */
async function createProduct(
	ctx: { db: DatabaseWriter },
	accountId: Id<'accounts'>,
	createdBy: Id<'users'>,
) {
	const now = Date.now()
	const productName = faker.commerce.productName()
	const price = Number.parseFloat(faker.commerce.price({ min: 10, max: 1000 }))
	const compareAtPrice = faker.datatype.boolean(0.3)
		? price * faker.number.float({ min: 1.1, max: 1.5 })
		: undefined

	const categories = [
		'Electronics',
		'Clothing',
		'Home & Garden',
		'Sports',
		'Books',
		'Health & Beauty',
		'Toys',
		'Automotive',
		'Food & Beverage',
		'Art',
	]

	const statuses = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const
	const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

	const productId = await ctx.db.insert('products', {
		name: productName,
		slug: faker.helpers.slugify(productName).toLowerCase(),
		description: faker.commerce.productDescription(),
		category: faker.helpers.arrayElement(categories),
		tags: faker.helpers.arrayElements(
			[
				'new',
				'popular',
				'sale',
				'featured',
				'limited',
				'premium',
				'eco-friendly',
			],
			{ min: 1, max: 3 },
		),
		imageUrl: faker.image.url({ width: 400, height: 400 }),
		images: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
			faker.image.url({ width: 400, height: 400 }),
		),
		price,
		currency: faker.helpers.arrayElement(currencies),
		compareAtPrice,
		sku: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
		trackInventory: faker.datatype.boolean(0.7),
		inventoryQuantity: faker.number.int({ min: 0, max: 1000 }),
		allowBackorder: faker.datatype.boolean(0.3),
		status: faker.helpers.arrayElement(statuses),
		featured: faker.datatype.boolean(0.2), // 20% featured
		metaTitle: `${productName} - Best Quality`,
		metaDescription: faker.lorem.sentence(),
		accountId,
		createdBy,
		updatedBy: createdBy,
		createdAt: now,
		updatedAt: now,
	})

	return productId
}

/**
 * Create sample activity logs
 */
export const createSampleActivityLogs = internalMutation({
	args: {
		count: v.optional(v.number()),
	},
	handler: async (ctx: MutationCtx, args) => {
		const { count = 50 } = args

		faker.seed(456) // Different seed for activity logs

		const users = await ctx.db.query('users').collect()
		const accounts = await ctx.db.query('accounts').collect()
		const products = await ctx.db.query('products').collect()

		if (users.length === 0) {
			throw new Error('No users found. Please run populateDatabase first.')
		}

		const actions = [
			'user.created',
			'user.updated',
			'user.deleted',
			'user.login',
			'account.created',
			'account.updated',
			'account.suspended',
			'product.created',
			'product.updated',
			'product.deleted',
			'invitation.sent',
			'invitation.accepted',
			'invitation.revoked',
		]

		const entityTypes = ['user', 'account', 'product', 'invitation']

		for (let i = 0; i < count; i++) {
			const actor = faker.helpers.arrayElement(users)
			const action = faker.helpers.arrayElement(actions)
			const entityType = faker.helpers.arrayElement(entityTypes)

			let entityId: string
			let accountId = actor.accountId

			// Generate appropriate entity ID based on type
			switch (entityType) {
				case 'user':
					entityId = faker.helpers.arrayElement(users)._id
					break
				case 'account': {
					const account = faker.helpers.arrayElement(accounts)
					entityId = account._id
					accountId = account._id
					break
				}
				case 'product':
					entityId = faker.helpers.arrayElement(products)._id
					break
				default:
					entityId = faker.string.uuid()
			}

			await ctx.db.insert('activityLogs', {
				action,
				entityType,
				entityId,
				actorId: actor._id,
				actorEmail: actor.email,
				actorRole: actor.role,
				accountId,
				metadata: {
					userAgent: faker.internet.userAgent(),
					timestamp: faker.date.recent({ days: 30 }).toISOString(),
				},
				ipAddress: faker.internet.ip(),
				userAgent: faker.internet.userAgent(),
				createdAt: faker.date.recent({ days: 30 }).getTime(),
			})
		}

		console.log(`✅ Created ${count} activity logs`)
	},
})

/**
 * Quick seed function for development - creates minimal data
 */
export const quickSeed = internalMutation({
	handler: async (ctx: MutationCtx) => {
		faker.seed(789)
		const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com'
		const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123'

		console.log('🚀 Quick seeding for development...')

		const superAdminId = await createSuperAdmin(ctx)

		const accountId = await createAccount(ctx, superAdminId)

		const adminUserId = await createUser(ctx, accountId, 'ADMIN')

		for (let i = 0; i < 5; i++) {
			await createProduct(ctx, accountId, adminUserId)
		}

		console.log('✅ Quick seed completed!')
		console.log(
			`👑 Super Admin: ${superAdminEmail} (password: ${superAdminPassword})`,
		)
	},
})
