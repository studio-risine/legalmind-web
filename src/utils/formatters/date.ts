import { dayjs } from '@libs/days'

export const DATE_FORMATS = {
	DISPLAY_DATE: 'LL', // August 16, 2018
	DISPLAY_DATE_SHORT: 'D MMM YYYY', // 16 Aug de 2025
	DISPLAY_DATETIME: 'LLL', // August 16, 25 8:02 PM

	DATE: 'DD-MM-YYYY',
	DATETIME: 'DD-MM-YYYY HH:mm:ss',
} as const

export const formatDate = (
	date: dayjs.ConfigType,
	format: string = DATE_FORMATS.DISPLAY_DATE,
): string => {
	if (!date) return ''
	try {
		return dayjs(date).format(format)
	} catch {
		return ''
	}
}

/**
 * Format a date for display (user-friendly format)
 * Main function used throughout the project
 */
export const formatDisplayDate = (date: dayjs.ConfigType): string => {
	return formatDate(date, DATE_FORMATS.DISPLAY_DATE)
}

/**
 * Check if date is valid
 * Essential for safe date handling
 */
export const isValidDate = (date: dayjs.ConfigType): boolean => {
	if (!date) return false
	try {
		return dayjs(date).isValid()
	} catch {
		return false
	}
}
