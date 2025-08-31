import { faker } from '@faker-js/faker'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import type { DatabaseWriter, MutationCtx } from './_generated/server'
import { internalMutation } from './_generated/server'

/**
 * Seed script to populate the database with fake data for development and testing.
 *
 * This script creates:
 * - A super admin user
 * - One account for the legal office
 * - 10 legal processes with different clients
 * - Deadlines for each process
 * - Tribunals for the processes
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
		processesCount: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { clearExisting = false, processesCount = 10 } = args

		// Set a consistent seed f	or reproducible results
		faker.seed(123)

		console.log('🌱 Starting database seeding...')

		if (clearExisting) {
			console.log('🗑️ Clearing existing data...')
			await clearDatabase(ctx)
		}

		console.log('👑 Creating super admin user...')
		const superAdminId = await createSuperAdmin(ctx)

		console.log('🏢 Creating legal office account...')
		const accountId = await createAccount(ctx, superAdminId)

		console.log('🏛️ Creating tribunals...')
		const tribunalIds = await createTribunals(ctx)

		console.log(`👥 Creating ${processesCount} clients...`)
		const clientIds = []
		for (let i = 0; i < processesCount; i++) {
			const clientId = await createClient(ctx, accountId, superAdminId)
			clientIds.push(clientId)
		}

		console.log(`⚖️ Creating ${processesCount} legal processes...`)
		const processIds = []
		for (let i = 0; i < processesCount; i++) {
			const processId = await createProcess(
				ctx,
				accountId,
				superAdminId,
				clientIds[i],
				tribunalIds,
			)
			processIds.push(processId)
		}

		console.log('📅 Creating deadlines for processes...')
		for (const processId of processIds) {
			await createDeadlines(ctx, processId, accountId, superAdminId)
		}

		console.log('✅ Database seeding completed successfully!')
		console.log('📊 Summary:')
		console.log('   - 1 Super Admin user')
		console.log('   - 1 Legal Office Account')
		console.log('   - 3 Tribunals')
		console.log('   - 10 Clients')
		console.log(`   - ${processesCount} Legal Processes`)
		console.log('   - Multiple Deadlines per Process')
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

	const deadlines = await ctx.db.query('deadlines').collect()
	for (const deadline of deadlines) {
		await ctx.db.delete(deadline._id)
	}

	const processes = await ctx.db.query('processes').collect()
	for (const process of processes) {
		await ctx.db.delete(process._id)
	}

	const clients = await ctx.db.query('clients').collect()
	for (const client of clients) {
		await ctx.db.delete(client._id)
	}

	const tribunals = await ctx.db.query('tribunals').collect()
	for (const tribunal of tribunals) {
		await ctx.db.delete(tribunal._id)
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
		FREE: { maxUsers: 3, maxProcesses: 10 },
		BASIC: { maxUsers: 10, maxProcesses: 50 },
		PRO: { maxUsers: 25, maxProcesses: 200 },
		ENTERPRISE: { maxUsers: 100, maxProcesses: 1000 },
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
		maxProcesses: planLimits[plan].maxProcesses,
		isActive: true,
		createdAt: now,
		updatedAt: now,
	})

	return accountId
}

/**
 * Create tribunals for legal processes
 */
async function createTribunals(ctx: { db: DatabaseWriter }) {
	const now = Date.now()
	const tribunalIds = []

	const tribunalsData = [
		{
			name: 'Tribunal de Justiça do Estado de São Paulo',
			code: 'TJSP',
			jurisdiction: 'Estadual',
			type: 'Cível',
		},
		{
			name: 'Tribunal Regional do Trabalho da 2ª Região',
			code: 'TRT2',
			jurisdiction: 'Federal',
			type: 'Trabalhista',
		},
		{
			name: 'Tribunal Regional Federal da 3ª Região',
			code: 'TRF3',
			jurisdiction: 'Federal',
			type: 'Federal',
		},
	]

	for (const tribunalData of tribunalsData) {
		const tribunalId = await ctx.db.insert('tribunals', {
			name: tribunalData.name,
			code: tribunalData.code,
			jurisdiction: tribunalData.jurisdiction,
			type: tribunalData.type,
			address: {
				street: faker.location.streetAddress(),
				city: faker.location.city(),
				state: faker.location.state(),
				zipCode: faker.location.zipCode(),
				country: 'Brasil',
			},
			contactInfo: {
				phone: faker.phone.number(),
				email: faker.internet.email(),
				website: faker.internet.url(),
			},
			isActive: true,
			createdAt: now,
			updatedAt: now,
		})
		tribunalIds.push(tribunalId)
	}

	return tribunalIds
}

/**
 * Create a client for legal processes
 */
async function createClient(
	ctx: { db: DatabaseWriter },
	accountId: Id<'accounts'>,
	createdBy: Id<'users'>,
) {
	const now = Date.now()
	const firstName = faker.person.firstName()
	const lastName = faker.person.lastName()
	const clientType = faker.helpers.arrayElement([
		'INDIVIDUAL',
		'COMPANY',
	] as const)

	const clientId = await ctx.db.insert('clients', {
		name:
			clientType === 'INDIVIDUAL'
				? `${firstName} ${lastName}`
				: faker.company.name(),
		document:
			clientType === 'INDIVIDUAL'
				? faker.string.numeric(11) // CPF
				: faker.string.numeric(14), // CNPJ
		documentType: clientType === 'INDIVIDUAL' ? 'CPF' : 'CNPJ',
		clientType,
		email: faker.internet.email(),
		phone: faker.phone.number(),
		address: {
			street: faker.location.streetAddress(),
			city: faker.location.city(),
			state: faker.location.state(),
			zipCode: faker.location.zipCode(),
			country: 'Brasil',
		},
		notes: faker.lorem.paragraph(),
		accountId,
		createdBy,
		updatedBy: createdBy,
		isActive: true,
		createdAt: now,
		updatedAt: now,
	})

	return clientId
}

/**
 * Create a legal process
 */
async function createProcess(
	ctx: { db: DatabaseWriter },
	accountId: Id<'accounts'>,
	createdBy: Id<'users'>,
	clientId: Id<'clients'>,
	tribunalIds: Id<'tribunals'>[],
) {
	const now = Date.now()
	const areas = [
		'CIVIL',
		'LABOR',
		'CRIMINAL',
		'FAMILY',
		'TAX',
		'ADMINISTRATIVE',
	] as const
	const statuses = ['ONGOING', 'SUSPENDED', 'ARCHIVED', 'CLOSED'] as const
	const partyTypes = ['INDIVIDUAL', 'COMPANY', 'GOVERNMENT'] as const

	const processId = await ctx.db.insert('processes', {
		caseNumber: faker.string.numeric(20),
		court: `${faker.company.name()} Court`,
		tribunalId: faker.helpers.arrayElement(tribunalIds),
		area: faker.helpers.arrayElement(areas),
		type: faker.lorem.words(2),
		parties: {
			plaintiff: {
				name: faker.person.fullName(),
				type: faker.helpers.arrayElement(partyTypes),
				document: faker.string.numeric(11),
			},
			defendant: {
				name: faker.person.fullName(),
				type: faker.helpers.arrayElement(partyTypes),
				document: faker.string.numeric(11),
			},
			lawyers: {
				plaintiff: [faker.person.fullName()],
				defendant: [faker.person.fullName()],
			},
		},
		status: faker.helpers.arrayElement(statuses),
		isPublic: faker.datatype.boolean(0.7),
		clientId,
		description: faker.lorem.paragraph(),
		value: faker.number.int({ min: 1000, max: 1000000 }),
		accountId,
		assignedTo: createdBy,
		createdBy,
		updatedBy: createdBy,
		createdAt: now,
		updatedAt: now,
	})

	return processId
}

/**
 * Create deadlines for a legal process
 */
async function createDeadlines(
	ctx: { db: DatabaseWriter },
	processId: Id<'processes'>,
	accountId: Id<'accounts'>,
	createdBy: Id<'users'>,
) {
	const now = Date.now()
	const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
	const statuses = ['PENDING', 'DONE', 'MISSED'] as const
	const timeUnits = ['BUSINESS_DAYS', 'CALENDAR_DAYS'] as const

	const deadlineTypes = [
		'Contestação',
		'Tréplica',
		'Audiência de Conciliação',
		'Apresentação de Documentos',
		'Recurso',
		'Cumprimento de Sentença',
	]

	// Create 2-4 deadlines per process
	const deadlineCount = faker.number.int({ min: 2, max: 4 })

	for (let i = 0; i < deadlineCount; i++) {
		const deadlineDate = faker.date.future({ years: 1 }).getTime()
		const deadlineType = faker.helpers.arrayElement(deadlineTypes)

		await ctx.db.insert('deadlines', {
			processId,
			title: deadlineType,
			taskDescription: `Realizar ${deadlineType.toLowerCase()} no processo`,
			deadlineDate,
			timeUnit: faker.helpers.arrayElement(timeUnits),
			isExtendable: faker.datatype.boolean(0.6),
			completionStatus: faker.helpers.arrayElement(statuses),
			priority: faker.helpers.arrayElement(priorities),
			assignedTo: createdBy,
			notes: faker.lorem.sentence(),
			reminders: [{ days: 7 }, { days: 3 }, { days: 1 }],
			accountId,
			createdBy,
			updatedBy: createdBy,
			createdAt: now,
			updatedAt: now,
		})
	}
}

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
		const tribunalIds = await createTribunals(ctx)

		for (let i = 0; i < 3; i++) {
			const clientId = await createClient(ctx, accountId, superAdminId)
			const processId = await createProcess(
				ctx,
				accountId,
				superAdminId,
				clientId,
				tribunalIds,
			)
			await createDeadlines(ctx, processId, accountId, superAdminId)
		}

		console.log('✅ Quick seed completed!')
		console.log(
			`👑 Super Admin: ${superAdminEmail} (password: ${superAdminPassword})`,
		)
	},
})
