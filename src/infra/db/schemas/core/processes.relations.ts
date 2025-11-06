import { relations } from 'drizzle-orm'
import { accounts } from './accounts'
import { clients } from './clients'
import { deadlines } from './deadlines'
import { processes } from './processes'
import { spaces } from './spaces'

export const processesRelations = relations(processes, ({ one, many }) => ({
	// Many-to-one: process belongs to a space
	space: one(spaces, {
		fields: [processes.spaceId],
		references: [spaces.id],
	}),
	// Many-to-one: process belongs to a client
	client: one(clients, {
		fields: [processes.clientId],
		references: [clients.id],
	}),
	// Many-to-one: process assigned to an account
	assignedTo: one(accounts, {
		relationName: 'accountAssignedProcesses',
		fields: [processes.assignedId],
		references: [accounts.id],
	}),
	// Many-to-one: process creator
	creator: one(accounts, {
		fields: [processes.createdBy],
		references: [accounts.id],
	}),
	// One-to-many: process has many deadlines
	deadlines: many(deadlines),
}))
