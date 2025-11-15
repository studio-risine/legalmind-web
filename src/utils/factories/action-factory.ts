import { formatZodError } from '@libs/zod/error-handlers'
import type { AuthError } from '@supabase/supabase-js'
import type { ZodError, ZodSchema } from 'zod'

export interface ActionResponse<T = unknown> {
	success: boolean
	data?: T
	error?: AuthError | ZodError | string | null
	message?: unknown
}

export function createValidatedAction<TInput, TOutput>(
	inputSchema: ZodSchema<TInput>,
) {
	return <TReturn extends ActionResponse<TOutput>>(
		action: (input: TInput) => Promise<TReturn>,
	) => {
		return async (rawInput: TInput): Promise<TReturn> => {
			const parseResult = inputSchema.safeParse(rawInput)

			if (!parseResult.success) {
				return {
					error: formatZodError(parseResult.error),
					success: false,
				} as TReturn
			}

			try {
				return await action(parseResult.data)
			} catch (error) {
				console.error('Action execution failed:', error)

				return {
					error:
						error instanceof Error ? error.message : 'Unknown error occurred',
					success: false,
				} as TReturn
			}
		}
	}
}

export function createValidatedActionWithOutput<TInput, TOutput>(
	inputSchema: ZodSchema<TInput>,
	outputSchema: ZodSchema<TOutput>,
) {
	return (action: (input: TInput) => Promise<TOutput>) => {
		return async (rawInput: TInput): Promise<ActionResponse<TOutput>> => {
			const inputParseResult = inputSchema.safeParse(rawInput)

			if (!inputParseResult.success) {
				return {
					error: `Input validation failed: ${formatZodError(inputParseResult.error)}`,
					success: false,
				}
			}

			try {
				const result = await action(inputParseResult.data)

				const outputParseResult = outputSchema.safeParse(result)

				if (!outputParseResult.success) {
					console.error('Output validation failed:', outputParseResult.error)

					return {
						error: 'Internal validation error',
						success: false,
					}
				}

				return {
					data: outputParseResult.data,
					success: true,
				}
			} catch (error) {
				console.error('Action execution failed:', error)

				return {
					error:
						error instanceof Error ? error.message : 'Unknown error occurred',
					success: false,
				}
			}
		}
	}
}

/**
 * Factory
 */
export const createAction = {
	raw: <TReturn extends ActionResponse>(action: () => Promise<TReturn>) =>
		action,
	withInput: createValidatedAction,
	withInputOutput: createValidatedActionWithOutput,
}
