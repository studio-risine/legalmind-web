/**
 *
 * @param processNumber - String of the process (CNJ format)
 * @returns String formatted as CNJ
 */
export function formatProcessNumber(processNumber: string): string {
	const cleanNumber = processNumber.replace(/\D/g, '')

	if (cleanNumber.length !== 20) {
		return processNumber
	}

	/**
	 * output: NNNNNNN-DD.AAAA.J.TR.OOOO
	 * example: 0000001-23.2020.1.12.3456
	 */
	const formatted = cleanNumber.replace(
		/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/,
		'$1-$2.$3.$4.$5.$6',
	)

	return formatted
}

/**
 * Removes formatting from the process number, leaving only digits
 * @param processNumber - Formatted or unformatted process number
 * @returns Only the numeric digits
 */
export function unformatProcessNumber(processNumber: string): string {
	return processNumber.replace(/\D/g, '')
}

/**
 * Validates if the process number is in the correct format (20 digits)
 * @param processNumber - Process number
 * @returns true if valid
 */
export function isValidProcessNumber(processNumber: string): boolean {
	const cleanNumber = unformatProcessNumber(processNumber)
	return cleanNumber.length === 20
}

/**
 * Applies a mask during typing in the CNJ format
 * @param value - Current input value
 * @returns Value with the mask applied
 */
export function maskProcessNumber(value: string): string {
	const cleanValue = value.replace(/\D/g, '')

	if (cleanValue.length <= 7) {
		return cleanValue
	}
	if (cleanValue.length <= 9) {
		return cleanValue.replace(/^(\d{7})(\d{0,2})/, '$1-$2')
	}
	if (cleanValue.length <= 13) {
		return cleanValue.replace(/^(\d{7})(\d{2})(\d{0,4})/, '$1-$2.$3')
	}
	if (cleanValue.length <= 14) {
		return cleanValue.replace(/^(\d{7})(\d{2})(\d{4})(\d{0,1})/, '$1-$2.$3.$4')
	}
	if (cleanValue.length <= 16) {
		return cleanValue.replace(
			/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{0,2})/,
			'$1-$2.$3.$4.$5',
		)
	}

	return cleanValue.replace(
		/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{0,4})/,
		'$1-$2.$3.$4.$5.$6',
	)
}
