/**
 * Utilities for CPF/CNPJ document formatting and validation.
 */

/**
 * Remove all non-numeric characters from a document string.
 * @param document - The document string to clean (may include formatting characters)
 * @returns The cleaned document containing only digits
 */
export function cleanDocument(document: string): string {
	return document.replace(/\D/g, '')
}

/**
 * Format a document (CPF or CNPJ) with the appropriate mask based on length.
 * - CPF (11 digits): `12345678901` → `123.456.789-01`
 * - CNPJ (14 digits): `12345678000195` → `12.345.678/0001-95`
 *
 * @param document - The document string to format
 * @returns A formatted document string for display
 */
export function formatDocumentWithMask(document: string): string {
	if (!document) return ''

	const cleaned = cleanDocument(document)

	// CPF format (11 digits): 123.456.789-01
	if (cleaned.length === 11) {
		return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
	}

	// CNPJ format (14 digits): 12.345.678/0001-95
	if (cleaned.length === 14) {
		return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
	}

	// If it doesn't match expected lengths, return the cleaned number
	return cleaned
}

/**
 * Apply document mask while the user types. This function keeps only digits
 * and applies the appropriate mask (CPF or CNPJ) based on the current length.
 * It limits input to 14 digits maximum (CNPJ length).
 *
 * @param value - The raw input value from the user
 * @returns The masked value suitable for showing inside an input
 */
export function applyDocumentMask(value: string): string {
	const cleaned = cleanDocument(value)

	// Limit input to 14 digits maximum (CNPJ)
	if (cleaned.length > 14) {
		return formatDocumentWithMask(cleaned.slice(0, 14))
	}

	return formatDocumentWithMask(cleaned)
}

/**
 * Remove formatting from a document string, returning only digits.
 * Useful to prepare values for storage or API submission.
 *
 * @param document - The formatted document string
 * @returns The unformatted document (digits only)
 */
export function unformatDocument(document: string): string {
	return cleanDocument(document)
}

/**
 * Validate CPF using the official algorithm.
 * @param cpf - The CPF string (digits only)
 * @returns `true` if CPF is valid, otherwise `false`
 */
export function isValidCPF(cpf: string): boolean {
	const cleaned = cleanDocument(cpf)

	// CPF must have exactly 11 digits
	if (cleaned.length !== 11) return false

	// Check for known invalid CPFs (all same digits)
	if (/^(\d)\1{10}$/.test(cleaned)) return false

	// Validate first check digit
	let sum = 0
	for (let i = 0; i < 9; i++) {
		sum += Number.parseInt(cleaned[i], 10) * (10 - i)
	}
	let remainder = (sum * 10) % 11
	if (remainder === 10) remainder = 0
	if (remainder !== Number.parseInt(cleaned[9], 10)) return false

	// Validate second check digit
	sum = 0
	for (let i = 0; i < 10; i++) {
		sum += Number.parseInt(cleaned[i], 10) * (11 - i)
	}
	remainder = (sum * 10) % 11
	if (remainder === 10) remainder = 0
	if (remainder !== Number.parseInt(cleaned[10], 10)) return false

	return true
}

/**
 * Validate CNPJ using the official algorithm.
 * @param cnpj - The CNPJ string (digits only)
 * @returns `true` if CNPJ is valid, otherwise `false`
 */
export function isValidCNPJ(cnpj: string): boolean {
	const cleaned = cleanDocument(cnpj)

	// CNPJ must have exactly 14 digits
	if (cleaned.length !== 14) return false

	// Check for known invalid CNPJs (all same digits)
	if (/^(\d)\1{13}$/.test(cleaned)) return false

	// Validate first check digit
	const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
	let sum = 0
	for (let i = 0; i < 12; i++) {
		sum += Number.parseInt(cleaned[i], 10) * weights1[i]
	}
	let remainder = sum % 11
	const digit1 = remainder < 2 ? 0 : 11 - remainder
	if (digit1 !== Number.parseInt(cleaned[12], 10)) return false

	// Validate second check digit
	const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9, 2]
	sum = 0
	for (let i = 0; i < 13; i++) {
		sum += Number.parseInt(cleaned[i], 10) * weights2[i]
	}
	remainder = sum % 11
	const digit2 = remainder < 2 ? 0 : 11 - remainder
	if (digit2 !== Number.parseInt(cleaned[13], 10)) return false

	return true
}

/**
 * Validate whether a document is a valid CPF or CNPJ.
 * @param document - Document string to validate
 * @returns `true` if the document is a valid CPF or CNPJ, otherwise `false`
 */
export function isValidDocument(document: string): boolean {
	const cleaned = cleanDocument(document)

	if (cleaned.length === 11) {
		return isValidCPF(cleaned)
	}

	if (cleaned.length === 14) {
		return isValidCNPJ(cleaned)
	}

	return false
}

/**
 * Detect the document type based on digit count.
 * @param document - Document string to analyze
 * @returns A string describing the type: 'cpf', 'cnpj', or 'invalid'
 */
export function getDocumentType(document: string): 'cpf' | 'cnpj' | 'invalid' {
	const cleaned = cleanDocument(document)

	switch (cleaned.length) {
		case 11:
			return 'cpf'
		case 14:
			return 'cnpj'
		default:
			return 'invalid'
	}
}
