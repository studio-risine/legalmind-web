/**
 * Async helpers (delays, wrappers)
 */

/** Delay execution for a specified time (ms) */
export async function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Error wrapper for async operations, preserving the original error after logging context upstream.
 * Kept name `trySeed` for backward compatibility with existing seeds.
 */
export async function trySeed<T>(
	operation: string,
	fn: () => Promise<T>,
): Promise<T> {
	try {
		return await fn()
	} catch (error) {
		// The caller is responsible for logging details; rethrow to keep stack intact
		throw Object.assign(
			error instanceof Error ? error : new Error(String(error)),
			{
				__operation: operation,
			},
		)
	}
}
