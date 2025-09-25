// Client Types and Interfaces
// This file defines all TypeScript types related to clients

import type { Database } from '@/types/database'

// Base client type from database
export type Client = Database['public']['Tables']['clients']['Row']

// Client form data for creating/updating
export interface ClientFormData {
	name: string
	document: string
	documentType: 'CPF' | 'CNPJ' | 'RG' | 'PASSPORT' | 'OTHER'
	clientType: 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT' | 'NGO'
	email?: string
	phone?: string
	address?: ClientAddress
	notes?: string
}

// Client address structure
export interface ClientAddress {
	street: string
	city: string
	state: string
	zipCode: string
	country: string
}

// Client filters for search/listing
export interface ClientFilters {
	name?: string
	document?: string
	clientType?: ClientFormData['clientType']
	documentType?: ClientFormData['documentType']
	isActive?: boolean
}

// Client search results
export interface ClientSearchResult {
	clients: Client[]
	total: number
	hasMore: boolean
	cursor?: string
}

// Client validation errors
export interface ClientValidationError {
	field: keyof ClientFormData
	message: string
}
