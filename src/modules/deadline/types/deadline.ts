// Deadline Types and Interfaces
// This file defines all TypeScript types related to deadlines

//import type { Database, Tables, TablesInsert, TablesUpdate } from '@types/database'

// Base deadline type from database
//export type Deadline = Tables('deadlines')

//export type DeadlineInsert = TablesInsert<'deadlines'>
//export type DeadlineUpdate = TablesUpdate<'deadlines'>

// // Deadline priority enum
// export type DeadlinePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// // Deadline status enum
// export type DeadlineStatus =
// 	| 'PENDING'
// 	| 'IN_PROGRESS'
// 	| 'COMPLETED'
// 	| 'MISSED'
// 	| 'CANCELLED'

// // Time unit for deadline calculations
// export type TimeUnit = 'BUSINESS_DAYS' | 'CALENDAR_DAYS' | 'HOURS'

// // Deadline reminder configuration
// export interface DeadlineReminder {
// 	id: string
// 	deadlineId: string
// 	reminderDate: string
// 	reminderType: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'
// 	message?: string
// 	isActive: boolean
// 	isSent: boolean
// }

// // Deadline form data for creating/updating
// export interface DeadlineFormData {
// 	title: string
// 	description?: string
// 	processId: string
// 	deadlineDate: string
// 	priority: DeadlinePriority
// 	assignedTo?: string
// 	isExtendable: boolean
// 	timeUnit: TimeUnit
// 	reminders?: Omit<DeadlineReminder, 'id' | 'deadlineId'>[]
// 	notes?: string
// }

// // Deadline filters for search/listing
// export interface DeadlineFilters {
// 	title?: string
// 	processId?: string
// 	status?: DeadlineStatus
// 	priority?: DeadlinePriority
// 	assignedTo?: string
// 	dateFrom?: string
// 	dateTo?: string
// 	isOverdue?: boolean
// }

// // Deadline search results
// export interface DeadlineSearchResult {
// 	deadlines: DeadlineWithRelations[]
// 	total: number
// 	hasMore: boolean
// 	cursor?: string
// }

// // Deadline with related data
// export interface DeadlineWithRelations extends Deadline {
// 	process?: {
// 		id: string
// 		title: string
// 		area: string
// 		status: string
// 	}
// 	assignedLawyer?: {
// 		id: string
// 		name: string
// 		email: string
// 	}
// 	reminders?: DeadlineReminder[]
// }

// // Deadline statistics
// export interface DeadlineStats {
// 	total: number
// 	pending: number
// 	completed: number
// 	missed: number
// 	overdue: number
// 	dueToday: number
// 	dueThisWeek: number
// }

export {}
