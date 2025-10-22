/**
 * Centralized logger with consistent formatting for CLI/scripts
 */
export const logger = {
	info: (message: string) => console.log(`ℹ️  ${message}`),
	success: (message: string) => console.log(`✅ ${message}`),
	error: (message: string) => console.error(`❌ ${message}`),
	warn: (message: string) => console.warn(`⚠️  ${message}`),
	section: (message: string) =>
		console.log(`\n${'='.repeat(60)}\n${message}\n${'='.repeat(60)}`),
	subsection: (message: string) => console.log(`\n--- ${message} ---`),
	debug: (label: string, data: unknown) =>
		console.log(`🐛 ${label}:`, JSON.stringify(data, null, 2)),
}

export default logger
