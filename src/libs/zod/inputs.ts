import { z } from 'zod'
import { isValidDocument } from '@/utils/document-mask'

const email = z.email('Digite um email válido').optional().or(z.literal(''))

const phone = z.string().refine(
	(phone) => {
		if (!phone || phone === '') return true

		const cleanPhone = phone.replace(/[\s()\-.]/g, '')

		if (cleanPhone.length === 11) {
			return /^[1-9]{2}9[0-9]{8}$/.test(cleanPhone)
		}

		return false
	},
	{
		message: 'Digite um telefone válido com DDD (ex: 85999013364)',
	},
)

const document = z
	.string()
	.optional()
	.refine(
		(doc) => {
			if (!doc || doc === '') return true
			return isValidDocument(doc)
		},
		{
			message: 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido',
		},
	)

export { phone, email, document }
