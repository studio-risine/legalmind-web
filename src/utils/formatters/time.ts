/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @returns The formatted number
 */
export function formatTime(milliseconds: number): string {
	const minimumMilliseconds = Math.max(0, milliseconds)
	const seconds = Math.ceil(minimumMilliseconds / 1000)
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60

	if (minutes > 0) {
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
	}
	return `${remainingSeconds}s`
}

/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @returns The formatted number
 */
export function formatDuration(milliseconds: number): string {
	const clampedMilliseconds = Math.max(0, milliseconds)
	const seconds = Math.ceil(clampedMilliseconds / 1000)
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60

	if (minutes > 0 && remainingSeconds > 0) {
		return `${minutes} minuto${minutes !== 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`
	}

	if (minutes > 0) {
		return `${minutes} minuto${minutes !== 1 ? 's' : ''}`
	}

	return `${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`
}

/**
 * Formats a number to the Brazilian format
 * @param value - The number to format
 * @returns The formatted number
 */
export function formatCountdown(milliseconds: number): string {
	const seconds = Math.ceil(milliseconds / 1000)
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = seconds % 60

	return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
