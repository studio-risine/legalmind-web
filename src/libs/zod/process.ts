import { isValidProcessNumber, unformatProcessNumber } from '@utils/formatters'
import { z } from 'zod'

/**
 * Process number schema (CNJ format: 20 digits)
 */
export const processNumberSchema = z
	.string()
	.min(1, 'Process number is required')
	.refine((val) => isValidProcessNumber(val), {
		message: 'Invalid CNJ process number format (must be 20 digits)',
	})
	.transform((val) => unformatProcessNumber(val))

/**
 * CSV import row schema for process
 */
export const csvProcessRowSchema = z.object({
	classe: z.string().optional(),
	data_distribuicao: z.coerce.date().optional(),
	numero_processo_cnj: processNumberSchema,
	parte_principal: z.string().min(1, 'Main party is required'),
	vara: z.string().optional(),
})

export type CsvProcessRow = z.infer<typeof csvProcessRowSchema>

/**
 * Deadline schema
 */
export const deadlineSchema = z.object({
	antecedenciaDias: z.coerce.number().int().nonnegative().default(5),
	descricao: z.string().min(1, 'Description is required'),
	dueDate: z.coerce.date(),
	responsavelId: z.string().uuid().optional(),
})

export type DeadlineInput = z.infer<typeof deadlineSchema>

/**
 * Document schema
 */
export const documentSchema = z.object({
	categoria: z.string().min(1, 'Category is required'),
	faseRef: z.string().optional(),
	mime: z.enum([
		'application/pdf',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'image/png',
		'image/jpeg',
	]),
	sizeBytes: z.number().max(25 * 1024 * 1024, 'File size must be under 25MB'),
	titulo: z.string().min(1, 'Title is required'),
})

export type DocumentInput = z.infer<typeof documentSchema>
