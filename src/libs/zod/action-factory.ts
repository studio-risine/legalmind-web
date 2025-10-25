import type { ZodSchema } from 'zod'
import { formatZodError } from './error-handlers'

export interface ActionResponse<T = unknown> {
	success: boolean
	data?: T
	error?: string
	details?: unknown
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
					success: false,
					error: formatZodError(parseResult.error),
				} as TReturn
			}

			try {
				return await action(parseResult.data)
			} catch (error) {
				console.error('Action execution failed:', error)
				return {
					success: false,
					error:
						error instanceof Error ? error.message : 'Unknown error occurred',
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
					success: false,
					error: `Input validation failed: ${formatZodError(inputParseResult.error)}`,
				}
			}

			try {
				const result = await action(inputParseResult.data)

				const outputParseResult = outputSchema.safeParse(result)

				if (!outputParseResult.success) {
					console.error('Output validation failed:', outputParseResult.error)
					return {
						success: false,
						error: 'Internal validation error',
					}
				}

				return {
					success: true,
					data: outputParseResult.data,
				}
			} catch (error) {
				console.error('Action execution failed:', error)
				return {
					success: false,
					error:
						error instanceof Error ? error.message : 'Unknown error occurred',
				}
			}
		}
	}
}

/**
 * Factory
 */
export const createAction = {
	withInput: createValidatedAction,
	withInputOutput: createValidatedActionWithOutput,
	raw: <TReturn extends ActionResponse>(action: () => Promise<TReturn>) =>
		action,
}
