import type { User } from '@supabase/supabase-js'
import { prisma } from './client'

export interface SyncUserData {
	supabaseId: string
	email: string
	firstName?: string
	lastName?: string
	phone?: string
}

/**
 * Sincroniza um usuário do Supabase com o banco de dados Prisma
 * Cria um novo usuário se não existir, ou atualiza os dados se já existir
 */
export async function syncUserWithSupabase(supabaseUser: User) {
	const userData = mapSupabaseUserToSyncData(supabaseUser)
	try {
		// Primeiro, tenta encontrar o usuário pelo supabaseId
		let user = await prisma.user.findFirst({
			where: {
				supabaseId: userData.supabaseId,
			},
			include: {
				accounts: true,
			},
		})

		if (!user) {
			user = await prisma.user.findUnique({
				where: {
					email: userData.email,
				},
				include: {
					accounts: true,
				},
			})

			// Se encontrou pelo email, atualiza com o supabaseId
			if (user) {
				user = await prisma.user.update({
					where: {
						id: user.id,
					},
					data: {
						supabaseId: userData.supabaseId,
						firstName: userData.firstName || user.firstName,
						lastName: userData.lastName || user.lastName,
						phone: userData.phone || user.phone,
					},
					include: {
						accounts: true,
					},
				})
			}
		}

		// Se ainda não existe, cria um novo usuário
		if (!user) {
			user = await prisma.user.create({
				data: {
					supabaseId: userData.supabaseId,
					email: userData.email,
					firstName: userData.firstName || '',
					lastName: userData.lastName || '',
					phone: userData.phone,
				},
				include: {
					accounts: true,
				},
			})

			// Cria uma conta padrão para o novo usuário
			await prisma.account.create({
				data: {
					userId: user.id,
					type: 'LAWYER', // Tipo padrão para novos usuários
				},
			})

			// Recarrega o usuário com a conta criada
			user = await prisma.user.findUnique({
				where: {
					id: user.id,
				},
				include: {
					accounts: true,
				},
			})
		}

		return user
	} catch (error) {
		console.error('Erro ao sincronizar usuário com Supabase:', error)
		throw new Error('Falha na sincronização do usuário')
	}
}

/**
 * Converte um usuário do Supabase para o formato esperado pela função de sincronização
 */
export function mapSupabaseUserToSyncData(supabaseUser: User): SyncUserData {
	const userMetadata = supabaseUser.user_metadata || {}
	const _appMetadata = supabaseUser.app_metadata || {}

	return {
		supabaseId: supabaseUser.id,
		email: supabaseUser.email!,
		firstName: userMetadata.first_name || userMetadata.firstName || '',
		lastName: userMetadata.last_name || userMetadata.lastName || '',
		phone: userMetadata.phone || supabaseUser.phone || undefined,
	}
}

/**
 * Função helper para sincronizar usuário a partir do objeto User do Supabase
 */
export async function syncSupabaseUser(supabaseUser: User) {
	return await syncUserWithSupabase(supabaseUser)
}

export default {
	syncUserWithSupabase,
	mapSupabaseUserToSyncData,
	syncSupabaseUser,
}
