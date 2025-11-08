import { isValidProcessNumber, unformatProcessNumber } from '@utils/formatters'
import z from 'zod'

export const idSchema = z.uuid('Invalid client id')

export const spaceIdSchemaDefault = z.string().min(1, 'Space ID é obrigatório')
export const nameSchemaDefault = z
	.string({
		message: 'O nome é obrigatório',
	})
	.min(2, {
		message: 'Nome deve ter ao menos 2 caracteres',
	})
	.max(255)

export const titleSchemaDefault = z
	.string({
		message: 'O título é obrigatório',
	})
	.min(2, {
		message: 'Título deve ter ao menos 2 caracteres',
	})
	.max(255)

export const emailSchemaDefault = z.email({
	message: 'Por favor, insira um endereço de email válido.',
})

export const passwordSchema = z.string().min(6, {
	message: 'A senha deve ter pelo menos 6 caracteres.',
})

/**
 * Schema para número de processo CNJ
 * Aceita números com ou sem formatação e os normaliza para 20 dígitos
 */
export const processNumberSchema = z
	.string({
		message: 'Número do processo é obrigatório',
	})
	.transform((value) => unformatProcessNumber(value))
	.refine((value) => isValidProcessNumber(value), {
		message: 'Número do processo deve ter exatamente 20 dígitos',
	})
