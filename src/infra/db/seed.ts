import { faker } from '@faker-js/faker'
import { createSupabaseAdminClient } from '@libs/supabase/server'
import { delay } from '@utils/async'
import { uuidv7 } from 'uuidv7'
import { db } from '.'
import { schema } from './schemas'
import { spacesToAccounts } from './schemas/spaces'

/**
 * Clean all users from auth.users and public.accounts
 */
async function cleanUsers(): Promise<void> {
	console.log('\n--- Cleaning users ---')

	const supabase = createSupabaseAdminClient()

	await db.delete(schema.accounts)
	console.log('ℹ️  Deleted all accounts from public.accounts')

	const { data: existingUsers } = await supabase.auth.admin.listUsers()
	if (existingUsers?.users && existingUsers.users.length > 0) {
		for (const user of existingUsers.users) {
			await supabase.auth.admin.deleteUser(user.id)
		}
		console.log(
			`ℹ️  Deleted ${existingUsers.users.length} users from auth.users`,
		)
	}
}

/**
 * Seed users via Supabase Auth API
 */
async function seedUsers(options: {
	count?: number
	includeTestUser?: boolean
	testUserEmail?: string
	testUserPassword?: string
}): Promise<void> {
	const {
		count = 4,
		includeTestUser = true,
		testUserEmail = 'john-doe@gmail.com',
		testUserPassword = 'R0A4kP5Af&uCRYUw&K4H',
	} = options

	console.log('\n--- Seeding users ---')

	const supabase = createSupabaseAdminClient()
	const createdUserIds: string[] = []

	// Create test user (if enabled)
	if (includeTestUser) {
		const { data, error } = await supabase.auth.admin.createUser({
			email: testUserEmail,
			password: testUserPassword,
			email_confirm: true,
			user_metadata: {
				display_name: 'John Doe',
				name: 'John',
				last_name: 'Doe',
			},
		})

		if (error) {
			console.error(`❌ Failed to create test user: ${testUserEmail}`)
			throw error
		}

		if (data.user) {
			createdUserIds.push(data.user.id)
			console.log(`✅ Created test user: ${testUserEmail}`)
		}
	}

	// Create random users
	const randomUserPromises = Array.from({ length: count }, async () => {
		const firstName = faker.person.firstName()
		const lastName = faker.person.lastName()
		const displayName = `${firstName} ${lastName}`
		const email = faker.internet.email().toLowerCase()

		const { data, error } = await supabase.auth.admin.createUser({
			email,
			password: 'Password123!',
			email_confirm: true,
			user_metadata: {
				display_name: displayName,
				name: firstName,
				last_name: lastName,
			},
		})

		if (error) {
			console.warn(`⚠️  Failed to create random user: ${email}`)
			return null
		}

		return data.user
	})

	const randomUsers = (await Promise.all(randomUserPromises)).filter(Boolean)
	createdUserIds.push(...randomUsers.map((u) => u!.id))

	console.log(
		`✅ Created ${createdUserIds.length} users in auth.users (${includeTestUser ? '1 test + ' : ''}${count} random)`,
	)

	// Wait for trigger to process
	console.log('ℹ️  Waiting for trigger to synchronize accounts...')
	await delay(2000)

	// Fetch synchronized accounts
	const accounts = await db.select().from(schema.accounts)

	if (accounts.length === 0) {
		console.error('❌ FATAL: No accounts were synchronized!')
		console.error('❌ The trigger may not be working correctly')
		throw new Error('User sync trigger failed')
	}

	if (accounts.length !== createdUserIds.length) {
		console.warn(
			`⚠️  Warning: Expected ${createdUserIds.length} accounts, but got ${accounts.length}`,
		)
	}

	console.log(`✅ ✓ ${accounts.length} accounts synchronized successfully`)
}

async function seed() {
	console.log('Initializing database seed...')

	try {
		console.log('Cleaning database...')
		await db.delete(schema.processes)
		await db.delete(schema.clients)
		await db.delete(spacesToAccounts)
		await db.delete(schema.spaces)

		await cleanUsers()

		console.log(
			'Creating users via Supabase Auth (trigger will sync accounts)...',
		)
		await seedUsers({ count: 4, includeTestUser: true })

		const seededAccounts = await db.select().from(schema.accounts)
		console.log(`${seededAccounts.length} accounts synchronized via trigger`)

		console.log('Creating spaces...')
		const spacesData = Array.from({ length: 3 }, (_, index) => ({
			id: uuidv7(),
			name: faker.company.name(),
			created_by: seededAccounts[index % seededAccounts.length].id,
		}))

		const seededSpaces = await db
			.insert(schema.spaces)
			.values(spacesData)
			.returning()
		console.log(`${seededSpaces.length} spaces created`)

		console.log('accociating accounts to spaces...')
		const spacesToAccountsData = seededAccounts.flatMap((account) =>
			seededSpaces.map((space) => ({
				accountId: account.id,
				spaceId: space.id,
			})),
		)

		await db.insert(spacesToAccounts).values(spacesToAccountsData)
		console.log(`${spacesToAccountsData.length} associações criadas`)

		console.log('Creating clients...')
		const clientsData = seededAccounts.flatMap((account) =>
			Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => ({
				account_id: account.id,
				type: faker.helpers.arrayElement(['INDIVIDUAL', 'COMPANY']) as
					| 'INDIVIDUAL'
					| 'COMPANY',
				status: faker.helpers.arrayElement([
					'LEAD',
					'PROSPECT',
					'ACTIVE',
					'INACTIVE',
				]) as 'LEAD' | 'PROSPECT' | 'ACTIVE' | 'INACTIVE',
				name: faker.person.fullName(),
				email: faker.internet.email().toLowerCase(),
				phone: faker.phone.number({ style: 'human' }),
				tax_id: faker.string.numeric(11),
				notes: faker.lorem.paragraph(),
			})),
		)

		const seededClients = await db
			.insert(schema.clients)
			.values(clientsData)
			.returning()
		console.log(`${seededClients.length} clients created`)

		console.log('Creating processes...')
		const processesData = seededClients.flatMap((client) =>
			Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
				const courtTypes = [
					'Tribunal de Justiça',
					'Tribunal Regional Federal',
					'Tribunal Superior do Trabalho',
					'Superior Tribunal de Justiça',
					'Supremo Tribunal Federal',
				]

				const processStatuses = [
					'PENDING',
					'ACTIVE',
					'SUSPENDED',
					'ARCHIVED',
					'CLOSED',
				]
				const tags = faker.helpers.arrayElements(
					[
						'CIVIL',
						'CRIMINAL',
						'TRABALHISTA',
						'TRIBUTARIO',
						'ADMINISTRATIVO',
						'COMERCIAL',
						'FAMILIA',
						'SUCESSOES',
					],
					{ min: 1, max: 3 },
				)

				return {
					space_id: faker.helpers.arrayElement(seededSpaces).id, // Processo pertence a um space
					client_id: client.id,
					cnj: faker.string.numeric(20),
					court: faker.helpers.arrayElement(courtTypes),
					title: faker.lorem.sentence({ min: 3, max: 8 }),
					status: faker.helpers.arrayElement(processStatuses) as
						| 'PENDING'
						| 'ACTIVE'
						| 'SUSPENDED'
						| 'ARCHIVED'
						| 'CLOSED',
					tags: tags,
					archived_at: faker.helpers.maybe(() => faker.date.past(), {
						probability: 0.2,
					}),
				}
			}),
		)

		const seededProcesses = await db
			.insert(schema.processes)
			.values(processesData)
			.returning()
		console.log(`${seededProcesses.length} processes created`)

		console.log('\n🎉 Seed is done!')
		console.log('Summary:')
		console.log(`   - Accounts: ${seededAccounts.length}`)
		console.log(`   - Spaces: ${seededSpaces.length}`)
		console.log(`   - Clients: ${seededClients.length}`)
		console.log(`   - Processes: ${seededProcesses.length}`)
	} catch (error) {
		console.error('Erro durante o seed:', error)
		throw error
	}
}

seed()
	.catch((error) => {
		console.error('💥 Falha no seed:', error)
		process.exit(1)
	})
	.finally(() => {
		console.log('Done!')
		process.exit(0)
	})
