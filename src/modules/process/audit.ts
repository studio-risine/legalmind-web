import { db } from '@infra/db'
import type { AuditAction, AuditEntity, InsertAuditLog } from '@infra/db/schemas/core'
import { auditLogs } from '@infra/db/schemas/core'

/**
 * Audit log helper for tracking process-related actions
 */

interface CreateAuditLogParams {
	spaceId: string
	actorId: string
	action: AuditAction
	entity: AuditEntity
	entityId: string
	summary: string
}

/**
 * Creates an audit log entry for process-related actions
 * @param params - Audit log parameters
 * @returns Promise that resolves when audit log is created
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
	const auditLog: InsertAuditLog = {
		action: params.action,
		actorId: params.actorId,
		entity: params.entity,
		entityId: params.entityId,
		spaceId: params.spaceId,
		summary: params.summary,
	}

	await db.insert(auditLogs).values(auditLog)
}

/**
 * Helper to generate summary text for common actions
 */
export const AuditSummary = {
	deadlineCompleted: (description: string) => `Deadline "${description}" completed`,
	deadlineCreated: (description: string) => `Deadline "${description}" created`,
	documentUploaded: (title: string) => `Document "${title}" uploaded`,
	eventCreated: (origin: string) => `Event added (${origin})`,
	processArchived: (processNumber: string) => `Process ${processNumber} archived`,
	processCreated: (processNumber: string) => `Process ${processNumber} created`,
	processUpdated: (processNumber: string) => `Process ${processNumber} updated`,
} as const
