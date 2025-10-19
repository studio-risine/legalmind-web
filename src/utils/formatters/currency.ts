/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @param currency - The currency code (default: BRL)
 * @returns The formatted number
 */

export function formatCurrency(value: number, currency = 'BRL'): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency,
	}).format(value)
}

/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @returns The formatted number
 */
export function formatCurrencyValue(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value)
}
