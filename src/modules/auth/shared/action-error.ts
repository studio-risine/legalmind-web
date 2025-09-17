export interface ActionError {
	code: string
	message: string
	field?: string
	originalError?: unknown
}

export function createActionError(
	code: string,
	message: string,
	field?: string,
	originalError?: unknown,
): ActionError {
	return {
		code,
		message,
		field,
		originalError,
	}
}

export const ERROR_CODES = {
	AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	SYSTEM_ERROR: 'SYSTEM_ERROR',
	UNKNOWN_ERROR: 'UNKNOWN_ERROR',
	INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
	USER_NOT_FOUND: 'USER_NOT_FOUND',
	EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
	WEAK_PASSWORD: 'WEAK_PASSWORD',
} as const
