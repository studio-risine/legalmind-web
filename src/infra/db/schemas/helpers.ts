/**
 * Database Column Helpers
 *
 * Reusable column definitions to maintain consistency across tables
 * and reduce code duplication.
 */

import { nanoid } from '@libs/nanoid'
import { text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { accounts } from './core'

/**
 * Standard timestamp columns for audit trail
 * Includes createdAt and updatedAt with timezone
 */
export const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

/**
 * Single createdAt timestamp (for junction tables or immutable records)
 */
export const createdAtTimestamp = timestamp('created_at', {
	withTimezone: true,
})
	.notNull()
	.defaultNow()

/**
 * Primary key
 */
export const uuidPrimaryKey = uuid('id').primaryKey().defaultRandom()
export const nanoPrimaryKey = text('id')
	.primaryKey()
	.$defaultFn(() => nanoid())

/**
 * createdBy field referencing auth.users.id
 * Use this for audit trail - tracks who created the record
 */
export const createdByField = uuid('created_by')
	.notNull()
	.references(() => accounts._id)

/**
 * Common audit fields: createdAt, createdBy, updatedAt
 * Use for entities that need full audit trail
 */
export const auditFields = {
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => accounts._id),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}
