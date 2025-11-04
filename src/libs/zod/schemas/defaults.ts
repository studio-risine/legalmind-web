import z from 'zod'

export const emailSchema = z.email({
	message: 'Por favor, insira um endereço de email válido.',
})

export const passwordSchema = z.string().min(6, {
	message: 'A senha deve ter pelo menos 6 caracteres.',
})
