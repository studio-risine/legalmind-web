/**
 * Format summary statistics as aligned lines
 */
export function formatSummary(stats: Record<string, number>): string {
	const entries = Object.entries(stats)
	if (entries.length === 0) return ''

	const maxLabelLength = Math.max(...entries.map(([label]) => label.length))

	return entries
		.map(([label, count]) => {
			const padding = ' '.repeat(maxLabelLength - label.length)
			return `   ${label}:${padding} ${count}`
		})
		.join('\n')
}

export default formatSummary
