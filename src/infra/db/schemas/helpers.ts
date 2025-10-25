/**
 * Database Column Helpers
 *
 * Reusable column definitions to maintain consistency across tables
 * and reduce code duplication.
 */

import { timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

/**
 * Standard timestamp columns for audit trail
 * Includes createdAt and updatedAt with timezone
 */
export const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
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
 * UUID primary key with auto-generation
 */
export const uuidPrimaryKey = uuid('id').primaryKey().defaultRandom()

/**
 * createdBy field referencing auth.users.id
 * Use this for audit trail - tracks who created the record
 */
export const createdByField = uuid('created_by')
	.notNull()
	.references(() => users.id)

/**
 * createdBy field with optional reference (nullable)
 */
export const createdByFieldOptional = uuid('created_by').references(
	() => users.id,
)

/**
 * Common audit fields: createdAt, createdBy, updatedAt
 * Use for entities that need full audit trail
 */
export const auditFields = {
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
}

/**
 * Minimal audit fields: just createdAt and createdBy
 * Use for immutable records (like notes, logs)
 */
export const minimalAuditFields = {
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
}
