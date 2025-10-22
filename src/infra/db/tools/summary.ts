import { db } from '..'
import { schema } from '../schemas'

async function summary() {
	try {
		const [accounts, spaces, clients, processes] = await Promise.all([
			db.select({ id: schema.accounts.id }).from(schema.accounts),
			db.select({ id: schema.spaces.id }).from(schema.spaces),
			db.select({ id: schema.clients.id }).from(schema.clients),
			db.select({ id: schema.processes.id }).from(schema.processes),
		])

		const fmt = (label: string, n: number) => `   - ${label}: ${n}`

		console.log('\n📊 Database summary:')
		console.log(fmt('Accounts', accounts.length))
		console.log(fmt('Spaces', spaces.length))
		console.log(fmt('Clients', clients.length))
		console.log(fmt('Processes', processes.length))
	} catch (error) {
		console.error('Failed to fetch DB summary:', error)
		process.exit(1)
	}
}

summary()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
