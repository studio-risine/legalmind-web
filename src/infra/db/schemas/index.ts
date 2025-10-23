import { accounts } from './accounts'
import { clients } from './clients'
import { deadlines } from './deadlines'
import { processes } from './processes'
import { spaces, spacesToAccounts } from './spaces'

export * from './enums'

export { accounts, clients, deadlines, processes, spaces, spacesToAccounts }

export const schema = {
	accounts,
	clients,
	deadlines,
	processes,
	spaces,
}
