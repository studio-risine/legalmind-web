import { faker } from '@faker-js/faker'
import { nanoid } from '@libs/nanoid'
import { createSupabaseAdminClient } from '@libs/supabase/admin'
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
	console.log('Deleted all accounts from public.accounts')

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
		testUserEmail = 'john-doe@acme.com',
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
		`Created ${createdUserIds.length} users in auth.users (${includeTestUser ? '1 test + ' : ''}${count} random)`,
	)

	// Wait for trigger to process
	console.log('Waiting for trigger to synchronize accounts...')
	await delay(2000)

	// Fetch synchronized accounts
	const accounts = await db.select().from(schema.accounts)

	if (accounts.length === 0) {
		console.error('FATAL: No accounts were synchronized!')
		console.error('The trigger may not be working correctly')
		throw new Error('User sync trigger failed')
	}

	if (accounts.length !== createdUserIds.length) {
		console.warn(
			`Warning: Expected ${createdUserIds.length} accounts, but got ${accounts.length}`,
		)
	}

	console.log(`${accounts.length} accounts synchronized successfully`)
}

async function seed() {
	console.log('Initializing database seed...')

	try {
		console.log('Cleaning database...')
		await db.delete(schema.processParticipants)
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
			id: nanoid(),
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

				const accessLevels = ['public', 'private', 'participants']

				const actionTypes = [
					'Procedimento Do Juizado Especial Civel',
					'Ação de Cobrança',
					'Ação de Despejo',
					'Ação Trabalhista',
					'Execução Fiscal',
					'Mandado de Segurança',
					'Ação de Indenização',
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

				// Generate fake CNJ number format: NNNNNNN-DD.AAAA.J.TR.OOOO
				const sequencial = faker.string.numeric(7)
				const dv = faker.string.numeric(2)
				const year = faker.date
					.between({ from: '2020-01-01', to: '2025-01-01' })
					.getFullYear()
				const segment = faker.helpers.arrayElement([
					'1',
					'2',
					'3',
					'4',
					'5',
					'6',
					'8',
				])
				const tribunal = faker.string.numeric(2)
				const origin = faker.string.numeric(4)
				const processNumber = `${sequencial}-${dv}.${year}.${segment}.${tribunal}.${origin}`

				return {
					space_id: faker.helpers.arrayElement(seededSpaces).id,
					client_id: client.id,
					responsible_id: faker.helpers.arrayElement(seededAccounts).id,
					title: `${client.name} x ${faker.company.name()}`,
					process_number: processNumber,
					action: faker.helpers.arrayElement(actionTypes),
					court: `${faker.number.int({ min: 1, max: 50 })}ª ${faker.helpers.arrayElement(courtTypes)} ${faker.location.city()}`,
					instance: faker.helpers.arrayElement([
						'1º Grau',
						'2º Grau',
						'3º Grau',
					]),
					lawsuit_value_cents: faker.number.int({ min: 0, max: 10000000 }), // 0 to 100,000 reais in cents
					sentence_value_cents: faker.number.int({ min: 0, max: 5000000 }), // 0 to 50,000 reais in cents
					distribution_date: faker.date
						.between({ from: '2020-01-01', to: '2025-01-01' })
						.toISOString()
						.split('T')[0],
					tribunal_link: faker.helpers.maybe(() => faker.internet.url(), {
						probability: 0.7,
					}),
					object: faker.lorem.paragraph(),
					observations: faker.helpers.maybe(() => faker.lorem.sentences(2), {
						probability: 0.6,
					}),
					status: faker.helpers.arrayElement(processStatuses) as
						| 'PENDING'
						| 'ACTIVE'
						| 'SUSPENDED'
						| 'ARCHIVED'
						| 'CLOSED',
					access_level: faker.helpers.arrayElement(accessLevels) as
						| 'public'
						| 'private'
						| 'participants',
					cnj: processNumber, // Keep legacy field for backward compatibility
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

		console.log('Creating process participants...')
		const participantsData = seededProcesses.flatMap((process) => {
			const roles = [
				'author',
				'author_lawyer',
				'defendant',
				'defendant_lawyer',
				'third_party',
			]
			const participantCount = faker.number.int({ min: 2, max: 5 })

			return Array.from({ length: participantCount }, (_, index) => {
				const role = faker.helpers.arrayElement(roles)
				const isMainClient = index === 0 && role === 'author' // First participant as main client if author

				return {
					process_id: process.id,
					name: faker.person.fullName(),
					role: role as
						| 'author'
						| 'author_lawyer'
						| 'defendant'
						| 'defendant_lawyer'
						| 'third_party',
					is_main_client: isMainClient,
				}
			})
		})

		const seededParticipants = await db
			.insert(schema.processParticipants)
			.values(participantsData)
			.returning()
		console.log(`${seededParticipants.length} process participants created`)

		console.log('\n🎉 Seed is done!')
		console.log('Summary:')
		console.log(`   - Accounts: ${seededAccounts.length}`)
		console.log(`   - Spaces: ${seededSpaces.length}`)
		console.log(`   - Clients: ${seededClients.length}`)
		console.log(`   - Processes: ${seededProcesses.length}`)
		console.log(`   - Process Participants: ${seededParticipants.length}`)
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
