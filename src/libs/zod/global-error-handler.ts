import type { ZodError, ZodIssue } from 'zod'
import { formatZodError, formatZodErrorDetailed } from './error-handlers'

/**
 * Classe base para erros de validação
 */
export abstract class ValidationError extends Error {
	abstract readonly code: string
	abstract readonly statusCode: number
	
	constructor(message: string, public readonly cause?: Error) {
		super(message)
		this.name = this.constructor.name
	}
}

/**
 * Erro específico para falhas de validação Zod
 */
export class ZodValidationError extends ValidationError {
	readonly code = 'ZOD_VALIDATION_ERROR'
	readonly statusCode = 400

	constructor(
		public readonly zodError: ZodError,
		message?: string,
	) {
		super(message || 'Validation failed', zodError)
	}

	/**
	 * Retorna erros formatados para exibição ao usuário
	 */
	getFormattedErrors() {
		return formatZodErrorDetailed(this.zodError)
	}

	/**
	 * Retorna mensagem concatenada de todos os erros
	 */
	getErrorMessage() {
		return formatZodError(this.zodError)
	}

	/**
	 * Retorna erros agrupados por campo
	 */
	getErrorsByField() {
		const errors: Record<string, string[]> = {}
		
		this.zodError.issues.forEach((issue: ZodIssue) => {
			const field = issue.path.join('.') || 'root'
			if (!errors[field]) {
				errors[field] = []
			}
			errors[field].push(issue.message)
		})
		
		return errors
	}
}

/**
 * Handler global para capturar e processar erros de validação
 */
export class GlobalErrorHandler {
	private static instance: GlobalErrorHandler
	private errorHandlers: Map<string, (error: Error) => unknown> = new Map()

	private constructor() {
		this.setupDefaultHandlers()
	}

	static getInstance(): GlobalErrorHandler {
		if (!GlobalErrorHandler.instance) {
			GlobalErrorHandler.instance = new GlobalErrorHandler()
		}
		return GlobalErrorHandler.instance
	}

	/**
	 * Configura handlers padrão para diferentes tipos de erro
	 */
	private setupDefaultHandlers() {
		this.registerHandler('ZodValidationError', (error: ZodValidationError) => ({
			success: false,
			error: error.getErrorMessage(),
			details: error.getFormattedErrors(),
			code: error.code,
		}))

		this.registerHandler('Error', (error: Error) => ({
			success: false,
			error: error.message,
			code: 'UNKNOWN_ERROR',
		}))
	}

	/**
	 * Registra um handler personalizado para um tipo de erro
	 */
	registerHandler(errorType: string, handler: (error: Error) => unknown) {
		this.errorHandlers.set(errorType, handler)
	}

	/**
	 * Processa um erro usando o handler apropriado
	 */
	handleError(error: Error): unknown {
		const errorType = error.constructor.name
		const handler = this.errorHandlers.get(errorType) || this.errorHandlers.get('Error')
		
		if (handler) {
			return handler(error)
		}

		// Fallback padrão
		return {
			success: false,
			error: 'An unexpected error occurred',
			code: 'UNKNOWN_ERROR',
		}
	}

	/**
	 * Wrapper para actions que automaticamente captura e processa erros
	 */
	wrapAction<T extends (...args: any[]) => Promise<any>>(action: T): T {
		return (async (...args: any[]) => {
			try {
				return await action(...args)
			} catch (error) {
				console.error('Action error:', error)
				return this.handleError(error as Error)
			}
		}) as T
	}
}

/**
 * Utility function para criar instância única do handler global
 */
export const globalErrorHandler = GlobalErrorHandler.getInstance()

/**
 * Decorator para server actions com error handling automático
 */
export function withGlobalErrorHandling<T extends (...args: any[]) => Promise<any>>(
	target: T,
): T {
	return globalErrorHandler.wrapAction(target)
}

/**
 * Factory function para validação com tratamento global de erros
 */
export function parseWithGlobalHandler<T>(schema: any, data: unknown): T {
	const result = schema.safeParse(data)
	
	if (!result.success) {
		throw new ZodValidationError(result.error)
	}
	
	return result.data
}