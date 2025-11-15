import { relations } from 'drizzle-orm'
import { deadlines } from './deadlines'
import { processes } from './processes'
import { spaces } from './spaces'

export const deadlinesRelations = relations(deadlines, ({ one }) => ({
	// Many-to-one: deadline belongs to a process
	process: one(processes, {
		fields: [deadlines.processId],
		references: [processes._id],
	}),
	// Many-to-one: deadline belongs to a space
	space: one(spaces, {
		fields: [deadlines.spaceId],
		references: [spaces._id],
	}),
}))
