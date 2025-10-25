import { text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { auditFields, uuidPrimaryKey } from '../helpers'
import { accounts } from './accounts'
import { processStatusEnum } from './enums'
import { core } from './schema'
import { spaces } from './spaces'

export const processes = core.table('processes', {
	id: uuidPrimaryKey,
	spaceId: text('space_id')
		.notNull()
		.references(() => spaces.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	processNumber: text('process_number').notNull(),
	status: processStatusEnum('status').notNull().default('ACTIVE'),
	assignedId: uuid('assigned_id')
		.notNull()
		.references(() => accounts.userId, { onDelete: 'set default' }),
	...auditFields,
})

export const insertProcessSchema = createInsertSchema(processes)
