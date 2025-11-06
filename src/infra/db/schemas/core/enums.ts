import { pgEnum } from 'drizzle-orm/pg-core'

export const spaceTypeEnum = pgEnum('space_type', [
	'INDIVIDUAL',
	'FIRM',
	'DEPARTMENT',
])

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
	'DONE',
	'CANCELED',
])

export const deadlinePriorityEnum = pgEnum('deadline_priority', [
	'LOW',
	'MEDIUM',
	'HIGH',
])
