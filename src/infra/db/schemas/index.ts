import { accounts } from './accounts'
import { clients } from './clients'
import { deadlines } from './deadlines'
import { notifications } from './notifications'
import { processes } from './processes'
import { profiles } from './profiles'
import { spaces } from './spaces'

export * from './enums'

export const schema = {
	accounts,
	clients,
	deadlines,
	processes,
	spaces,
	notifications,
	profiles,
}
