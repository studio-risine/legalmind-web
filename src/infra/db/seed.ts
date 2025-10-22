import { faker } from '@faker-js/faker'
import { uuidv7 } from 'uuidv7'
import { db } from '.'
import { schema } from './schemas'
import { spacesToAccounts } from './schemas/spaces'

async function seed() {
	console.log('Initializing database seed...')

	try {
		console.log('Cleaning database...')
		await db.delete(schema.processes)
		await db.delete(schema.clients)
		await db.delete(spacesToAccounts)
		await db.delete(schema.spaces)
		await db.delete(schema.accounts)

	console.log('Create accounts...')
	const accountsData = Array.from({ length: 5 }, () => ({
		id: uuidv7(),
		name: faker.person.fullName(),
		displayName: faker.person.firstName(),
		email: faker.internet.email().toLowerCase(),
	}))

	const seededAccounts = await db
		.insert(schema.accounts)
		.values(accountsData)
		.returning()
	console.log(`${seededAccounts.length} accounts created`)

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
