'use server'

import type { Account } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import type { AuthError } from '@supabase/supabase-js'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Output {
	data: Account | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const outputSchema = z.object({
	data: z.custom<Account>().nullable(),
})

async function handler(): Promise<Output> {
	const { data: user, error } = await userAuthAction()

	if (!user?.id) {
		return {
			data: null,
			success: false,
			error: error,
			message: 'User not authenticated',
		}
	}

	const accountRepository = makeAccountRepository()
	const account = await accountRepository.findByUserId(user.id)

	if (!account) {
		return {
			data: null,
			success: false,
			message: 'Conta não encontrada.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: account })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	return {
		data: account,
		success: true,
	}
}

export const accountByUserIdAction = cache(handler)
