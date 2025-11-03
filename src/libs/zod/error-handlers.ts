import type { ZodError, ZodIssue, ZodSchema } from 'zod'

/**
 * Format a single Zod issue into a string message
 */
export function formatZodIssue(issue: ZodIssue): string {
	const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
	return `${path}${issue.message}`
}

/**
 * Format Zod errors into a single string message
 */
export function formatZodError(error: ZodError): string {
	return error.issues.map(formatZodIssue).join(', ')
}

/**
 * Format Zod errors into a detailed structure
 */

export function formatZodErrorDetailed(error: ZodError) {
	return error.issues.map((issue) => ({
		field: issue.path.join('.') || 'root',
		message: issue.message,
		code: issue.code,
		value: 'received' in issue ? issue.received : undefined,
	}))
}

/**
 * Create a response object for Zod validation errors
 */
export function createValidationErrorResponse(error: ZodError) {
	return {
		success: false,
		error: 'Validation failed',
		details: formatZodErrorDetailed(error),
		message: formatZodError(error),
	}
}

/**
 * Handler genérico para server actions com validação Zod
 */
export function withZodValidation<T, R>(
	schema: ZodSchema<T>,
	handler: (data: T) => Promise<R>,
) {
	return async (
		input: unknown,
	): Promise<R | { success: false; error: string }> => {
		const parsed = schema.safeParse(input)

		if (!parsed.success) {
			return {
				success: false,
				error: formatZodError(parsed.error),
			}
		}

		return handler(parsed.data)
	}
}
