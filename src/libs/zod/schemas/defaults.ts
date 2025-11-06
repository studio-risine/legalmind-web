import z from 'zod'

export const idSchema = z.uuid('Invalid client id')

export const spaceIdSchemaDefault = z.string().min(1, 'Space ID é obrigatório')
export const nameSchemaDefault = z
	.string()
	.min(2, 'Nome deve ter ao menos 2 caracteres')
	.max(255)

export const emailSchemaDefault = z.email({
	message: 'Por favor, insira um endereço de email válido.',
})

export const passwordSchema = z.string().min(6, {
	message: 'A senha deve ter pelo menos 6 caracteres.',
})
