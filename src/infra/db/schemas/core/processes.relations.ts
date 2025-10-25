import { relations } from 'drizzle-orm'
import { users } from '../auth/users'
import { accounts } from './accounts'
import { processes } from './processes'
import { spaces } from './spaces'

export const processesRelations = relations(processes, ({ one }) => ({
	// Many-to-one: process to a space
	space: one(spaces, {
		fields: [processes.spaceId],
		references: [spaces.id],
	}),
	// Many-to-one: process to an account (assignedId)
	assignedTo: one(accounts, {
		relationName: 'accountAssignedProcesses',
		fields: [processes.assignedId],
		references: [accounts.userId],
	}),
	// Many-to-one: process to a user (creator)
	creator: one(users, {
		fields: [processes.createdBy],
		references: [users.id],
	}),
}))
