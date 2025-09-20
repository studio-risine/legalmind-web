/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @param decimals - The number of decimal places (default: 0)
 * @returns The formatted number
 */

export function formatNumber(value: number, decimals = 0): string {
	return new Intl.NumberFormat('pt-BR', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value)
}

/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @param decimals - The number of decimal places (default: 0)
 * @returns The formatted number
 */
export function formatPercentage(value: number, decimals = 1): string {
	const normalizedValue = value > 1 ? value / 100 : value

	return new Intl.NumberFormat('pt-BR', {
		style: 'percent',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(normalizedValue)
}

/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @returns The formatted number
 */
export function formatInteger(value: number): string {
	return new Intl.NumberFormat('pt-BR').format(Math.floor(value))
}
