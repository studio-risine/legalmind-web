// // Process Types and Interfaces
// // This file defines all TypeScript types related to legal processes

// import type { Database } from '@types/database'

// Export placeholder types to make this a valid module
export type ProcessPlaceholder = string

// // Base process type from database
// export type Process = Database['public']['Tables']['processes']['Row']

// // Process areas enum
// export type ProcessArea =
// 	| 'CIVIL'
// 	| 'LABOR'
// 	| 'CRIMINAL'
// 	| 'FAMILY'
// 	| 'TAX'
// 	| 'ADMINISTRATIVE'
// 	| 'CONSTITUTIONAL'
// 	| 'INTERNATIONAL'

// // Process status enum
// export type ProcessStatus = 'ACTIVE' | 'SUSPENDED' | 'CONCLUDED' | 'ARCHIVED'

// // Process priority enum
// export type ProcessPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// // Process parties structure
// export interface ProcessParties {
// 	plaintiff: {
// 		name: string
// 		type: 'individual' | 'company' | 'government'
// 		document?: string
// 	}
// 	defendant: {
// 		name: string
// 		type: 'individual' | 'company' | 'government'
// 		document?: string
// 	}
// 	lawyers?: {
// 		plaintiff?: string[]
// 		defendant?: string[]
// 	}
// }

// // Process form data for creating/updating
// export interface ProcessFormData {
// 	title: string
// 	description?: string
// 	area: ProcessArea
// 	status: ProcessStatus
// 	priority: ProcessPriority
// 	clientId?: string
// 	assignedLawyerId?: string
// 	metadata?: Record<string, unknown>
// 	tags?: string[]
// }

// // Process filters for search/listing
// export interface ProcessFilters {
// 	title?: string
// 	area?: ProcessArea
// 	status?: ProcessStatus
// 	priority?: ProcessPriority
// 	clientId?: string
// 	assignedLawyerId?: string
// 	tags?: string[]
// }

// // Process search results
// export interface ProcessSearchResult {
// 	processes: Process[]
// 	total: number
// 	hasMore: boolean
// 	cursor?: string
// }

// // Process with related data
// export interface ProcessWithRelations extends Process {
// 	client?: {
// 		id: string
// 		name: string
// 	}
// 	assignedLawyer?: {
// 		id: string
// 		name: string
// 	}
// 	deadlines?: Array<{
// 		id: string
// 		title: string
// 		deadlineDate: string
// 		status: string
// 	}>
// }
