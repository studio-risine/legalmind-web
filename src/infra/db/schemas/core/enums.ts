import { pgEnum } from 'drizzle-orm/pg-core'

export const spaceTypeEnum = pgEnum('space_type', ['INDIVIDUAL', 'FIRM', 'DEPARTMENT'])

export const processStatusEnum = pgEnum('process_status', [
	'PENDING',
	'ACTIVE',
	'SUSPENDED',
	'ARCHIVED',
	'CLOSED',
])

export const clientTypeEnum = pgEnum('client_type', ['INDIVIDUAL', 'COMPANY'])

export const clientStatusEnum = pgEnum('client_status', [
	'LEAD',
	'PROSPECT',
	'ACTIVE',
	'INACTIVE',
	'ARCHIVED',
])

export const deadlineStatusEnum = pgEnum('deadline_status', [
	'OPEN',
	'IN_PROGRESS',
	'DONE',
	'CANCELED',
	'OVERDUE',
])

export const deadlinePriorityEnum = pgEnum('deadline_priority', ['URGENT', 'LOW', 'MEDIUM', 'HIGH'])

export const alertModeEnum = pgEnum('alert_mode', ['NORMAL', 'REDUCED'])

export const alertStatusEnum = pgEnum('alert_status', ['ACTIVE', 'TRIGGERED'])

export const documentCategoryEnum = pgEnum('document_category', [
	'PETITION', // Petição
	'CONTRACT', // Contrato
	'EVIDENCE', // Prova
	'DECISION', // Decisão
	'OTHER',
])

export const eventOriginEnum = pgEnum('event_origin', [
	'EXTERNAL', // From court/external system
	'INTERNAL', // Created by user
])

export const auditActionEnum = pgEnum('audit_action', [
	'CREATE',
	'UPDATE',
	'DELETE',
	'COMPLETE',
	'UPLOAD',
	'ARCHIVE',
])

export const auditEntityEnum = pgEnum('audit_entity', ['PROCESS', 'DEADLINE', 'DOCUMENT', 'EVENT'])
