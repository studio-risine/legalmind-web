'use server'

import { createClient } from '@/libs/supabase/server'
import { type Either, left, right } from '@/utils/either'
import { type ActionError, createActionError } from '../shared/action-error'

type SignOutSuccess = {
	redirect: string
	message: string
}

export async function signOut(): Promise<Either<ActionError, SignOutSuccess>> {
	try {
		const supabase = await createClient()

		const { error } = await supabase.auth.signOut()

		if (error) {
			return left(
				createActionError(
					error.code ?? 'SIGN_OUT_FAILED',
					error.message || 'Erro ao fazer logout',
					undefined,
					error,
				),
			)
		}

		return right({
			redirect: '/auth/login',
			message: 'Logout realizado com sucesso',
		})
	} catch (error) {
		return left(
			createActionError(
				'SYSTEM_ERROR',
				'Erro interno do sistema durante o logout',
				undefined,
				error,
			),
		)
	}
}
