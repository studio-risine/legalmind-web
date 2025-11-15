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
	oabNumber: z.string().min(1, {
		message: 'O número da OAB é obrigatório',
	}),
	oabState: z.string().length(2, {
		message: 'O estado da OAB é obrigatório',
	}),
	phoneNumber: z.string().optional(),
})

const outputSchema = z.object({
	data: z.uuid(),
})

async function handler(input: Input): Promise<Output> {
	const inputParsed = inpuptSchema.safeParse(input)

	if (!inputParsed.success) {
		return {
			data: null,
			error: inputParsed.error,
			message: formatZodError(inputParsed.error),
			success: false,
		}
	}

	const { data: user, error } = await userAuthAction()

	if (!user?.id || !user?.email) {
		return {
			data: null,
			error: error,
			message: 'User not authenticated',
			success: false,
		}
	}

	const account = makeAccountRepository()
	const isUserAccountPresent = await account.findByUserId(user.id)

	if (isUserAccountPresent) {
		return {
			data: null,
			message: 'Já existe uma aconta associada ao seu usuário.',
			success: false,
		}
	}

	const { accountId } = await account.insert({
		displayName: input.displayName,
		email: user.email,
		oabNumber: input.oabNumber,
		oabState: input.oabState,
		phoneNumber: input.phoneNumber ?? null,
		userId: user.id,
	})

	if (!accountId) {
		return {
			data: null,
			message: 'Ocorreu um erro ao criar a conta, tente novamente mais tarde.',
			success: false,
		}
	}

	const outputParsed = outputSchema.safeParse({
		data: accountId,
	})

	if (!outputParsed.success) {
		return {
			data: null,
			error: outputParsed.error,
			message: formatZodError(outputParsed.error),
			success: false,
		}
	}

	revalidatePath('/account')

	return {
		data: accountId,
		success: true,
	}
}

export const insertAccountAction = cache(handler)
