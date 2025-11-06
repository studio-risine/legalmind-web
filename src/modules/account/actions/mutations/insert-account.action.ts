'use server'

import type { InsertAccount } from '@infra/db/schemas'
import { formatZodError } from '@libs/zod/error-handlers'
import { makeAccountRepository } from '@modules/account/factories'
import { userAuthAction } from '@modules/auth/actions/user-auth.action'
import type { AuthError } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import z, { type ZodError } from 'zod'

export interface Input
	extends Pick<
		InsertAccount,
		'displayName' | 'phoneNumber' | 'oabNumber' | 'oabState'
	> {}

export interface Output {
	data: string | null
	success: boolean
	message?: string | null
	error?: ZodError | AuthError | null
}

const inpuptSchema = z.object({
	displayName: z.string().min(2).max(100),
	phoneNumber: z.string().optional(),
	oabNumber: z.string().min(1, {
		message: 'O número da OAB é obrigatório',
	}),
	oabState: z.string().length(2, {
		message: 'O estado da OAB é obrigatório',
	}),
})

const outputSchema = z.object({
	data: z.uuid(),
})

async function handler(input: Input): Promise<Output> {
	const inputParsed = inpuptSchema.safeParse(input)

	if (!inputParsed.success) {
		return {
			data: null,
			success: false,
			error: inputParsed.error,
			message: formatZodError(inputParsed.error),
		}
	}

	const { data: user, error } = await userAuthAction()

	if (!user?.id || !user?.email) {
		return {
			data: null,
			success: false,
			error: error,
			message: 'User not authenticated',
		}
	}

	const account = makeAccountRepository()
	const isUserAccountPresent = await account.findByUserId(user.id)

	if (isUserAccountPresent) {
		return {
			data: null,
			success: false,
			message: 'Já existe uma aconta associada ao seu usuário.',
		}
	}

	const { accountId } = await account.insert({
		userId: user.id,
		email: user.email,
		phoneNumber: input.phoneNumber ?? null,
		oabNumber: input.oabNumber,
		oabState: input.oabState,
		displayName: input.displayName,
	})

	if (!accountId) {
		return {
			data: null,
			success: false,
			message: 'Ocorreu um erro ao criar a conta, tente novamente mais tarde.',
		}
	}

	const outputParsed = outputSchema.safeParse({ data: accountId })

	if (!outputParsed.success) {
		return {
			data: null,
			success: false,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
		}
	}

	revalidatePath('/account')

	return {
		data: accountId,
		success: true,
	}
}

export const insertAccountAction = cache(handler)
