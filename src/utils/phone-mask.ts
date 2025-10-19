/**
 * Utilities for phone number formatting and masking.
 */

/**
 * Remove all non-numeric characters from a phone string.
 * @param phone - The phone string to clean (may include formatting characters)
 * @returns The cleaned phone containing only digits
 */
export function cleanPhone(phone: string): string {
	return phone.replace(/\D/g, '')
}

/**
 * Format a phone number using a mask for display.
 * Currently supports the standard 11-digit format (DDD + 9-digit mobile).
 * Example: `85999013364` → `(85) 99901.3364`.
 * If the input does not match the expected digit length, the cleaned digits
 * are returned unchanged.
 *
 * @param phone - The phone string to format (may include formatting chars)
 * @returns A formatted phone string for display
 */
export function formatPhoneWithMask(phone: string): string {
	if (!phone) return ''

	const cleaned = cleanPhone(phone)

	if (cleaned.length === 11) {
		return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2.$3')
	}

	return cleaned
}

/**
 * Apply a phone mask while the user types. This function keeps only digits
 * and applies the display mask incrementally. It also limits the value to
 * the maximum supported length (11 digits).
 *
 * @param value - The raw input value from the user
 * @returns The masked value suitable for showing inside an input
 */
export function applyPhoneMask(value: string): string {
	const cleaned = cleanPhone(value)

	// Limit the input to 11 digits maximum
	if (cleaned.length > 11) {
		return formatPhoneWithMask(cleaned.slice(0, 11))
	}

	return formatPhoneWithMask(cleaned)
}

/**
 * Remove formatting from a phone string, returning only digits.
 * Useful to prepare values for storage or API submission.
 *
 * @param phone - The formatted phone string
 * @returns The unformatted phone (digits only)
 */
export function unformatPhone(phone: string): string {
	return cleanPhone(phone)
}

/**
 * Validate whether the phone matches the accepted 11-digit format
 * (DDD + 9-digit mobile starting with 9).
 *
 * @param phone - Phone string to validate
 * @returns `true` if the phone matches the expected format, otherwise `false`
 */
export function isValidPhoneFormat(phone: string): boolean {
	const cleaned = cleanPhone(phone)

	if (cleaned.length === 11) {
		return /^[1-9]{2}9[0-9]{8}$/.test(cleaned)
	}

	return false
}
