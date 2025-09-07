import { prisma } from './client'
import type { Account, User } from './generated'

export interface UserWithAccounts extends User {
	accounts: Account[]
}

export async function getUserBySupabaseId(
	supabaseId: string,
): Promise<UserWithAccounts | null> {
	try {
		const user = await prisma.user.findUnique({
			where: {
				supabaseId: supabaseId,
			},
			include: {
				accounts: true,
			},
		})

		return user
	} catch (error) {
		console.error('Erro ao buscar usuário por Supabase ID:', error)
		return null
	}
}

export async function getUserByEmail(
	email: string,
): Promise<UserWithAccounts | null> {
	try {
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
			include: {
				accounts: true,
			},
		})

		return user
	} catch (error) {
		console.error('Erro ao buscar usuário por email:', error)
		return null
	}
}

export async function getUserById(
	id: string,
): Promise<UserWithAccounts | null> {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: id,
			},
			include: {
				accounts: true,
			},
		})

		return user
	} catch (error) {
		console.error('Erro ao buscar usuário por ID:', error)
		return null
	}
}

export async function userExistsBySupabaseId(
	supabaseId: string,
): Promise<boolean> {
	try {
		const user = await prisma.user.findUnique({
			where: {
				supabaseId: supabaseId,
			},
			select: {
				id: true,
			},
		})

		return user !== null
	} catch (error) {
		console.error('Erro ao verificar existência do usuário:', error)
		return false
	}
}

export async function updateUserData(
	userId: string,
	data: {
		firstName?: string
		lastName?: string
		phone?: string
	},
): Promise<UserWithAccounts | null> {
	try {
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				...data,
			},
			include: {
				accounts: true,
			},
		})

		return user
	} catch (error) {
		console.error('Erro ao atualizar dados do usuário:', error)
		return null
	}
}

export async function getUsers({
	skip = 0,
	take = 10,
	orderBy = 'createdAt',
}: {
	skip?: number
	take?: number
	orderBy?: 'createdAt' | 'firstName' | 'lastName' | 'email'
} = {}) {
	try {
		const [users, total] = await Promise.all([
			prisma.user.findMany({
				skip,
				take,
				orderBy: {
					[orderBy]: 'asc',
				},
				include: {
					accounts: true,
				},
			}),
			prisma.user.count(),
		])

		return {
			users,
			total,
			hasMore: skip + take < total,
		}
	} catch (error) {
		console.error('Erro ao buscar usuários:', error)
		return {
			users: [],
			total: 0,
			hasMore: false,
		}
	}
}

export default {
	getUserBySupabaseId,
	getUserByEmail,
	getUserById,
	userExistsBySupabaseId,
	updateUserData,
	getUsers,
}
