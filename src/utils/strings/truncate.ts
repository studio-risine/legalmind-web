export function truncateString(text: string, maxLength = 40): string {
	if (text.length <= maxLength) {
		return text
	}
	return `${text.slice(0, maxLength)}...`
}
