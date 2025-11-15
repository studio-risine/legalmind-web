/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @param decimals - The number of decimal places (default: 0)
 * @returns The formatted number
 */

export function formatNumber(value: number, decimals = 0): string {
	return new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: decimals,
		minimumFractionDigits: decimals,
	}).format(value)
}

/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @param decimals - The number of decimal places (default: 0)
 * @returns The formatted number
 */
export function formatPercentage(value: number, decimals = 1): string {
	// Guard against non-finite values
	if (!Number.isFinite(value) || !Number.isFinite(decimals)) {
		return '-'
	}

	// Clamp decimals to valid Intl range (0-20)
	const clampedDecimals = Math.min(Math.max(Math.trunc(decimals), 0), 20)

	// Use Math.abs for comparison while preserving sign
	const normalizedValue = Math.abs(value) > 1 ? value / 100 : value

	return new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: clampedDecimals,
		minimumFractionDigits: clampedDecimals,
		style: 'percent',
	}).format(normalizedValue)
}

/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @returns The formatted number
 */
export function formatInteger(value: number): string {
	if (!Number.isFinite(value)) return String(value)

	return new Intl.NumberFormat('pt-BR').format(Math.trunc(value))
}
